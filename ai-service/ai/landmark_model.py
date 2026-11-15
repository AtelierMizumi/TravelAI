"""Real EfficientNetV2-S inference; output indices must match the exported model."""
import hashlib
import io
import json
import logging
import os
from pathlib import Path
from threading import Lock

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = Path(os.getenv('LANDMARK_CATALOG_PATH', ROOT / 'shared/landmarks.json'))
CATALOG = json.loads(CATALOG_PATH.read_text(encoding='utf-8'))
LANDMARKS = {row['code']: row for row in CATALOG['landmarks']}
MODEL_PATH = Path(os.getenv('LANDMARK_MODEL_PATH', ROOT / 'ai-service/models/landmark_classifier.onnx'))
CLASSES_PATH = Path(os.getenv('LANDMARK_CLASSES_PATH', ROOT / 'ai-service/models/classes.json'))
EXPECTED_SHA256 = 'b3e69b571a0c2c7943e0d4e68f2e5b3fae51df5b612535f7fa57cd8d47f058cc'
logger = logging.getLogger('travelai.landmark_model')


def classify_logits(logits, classes, minimum=0.70, margin=0.15):
    values = np.asarray(logits, dtype=np.float64).reshape(-1)
    if len(values) != len(classes) or not np.all(np.isfinite(values)):
        raise ValueError('Model output does not match class mapping')
    exp = np.exp(values - values.max())
    probabilities = exp / exp.sum()
    order = np.argsort(probabilities)[::-1]
    code = classes[str(int(order[0]))]
    score = float(probabilities[order[0]])
    gap = score - float(probabilities[order[1]])
    enabled = bool(LANDMARKS.get(code, {}).get('localModelEnabled'))
    # Never drop excluded logits and renormalize: that would inflate confidence.
    return {'code': code, 'confidence': score, 'margin': gap,
            'accepted': enabled and score >= minimum and gap >= margin,
            'enabled': enabled, 'candidates': [
                {'code': classes[str(int(i))], 'score': float(probabilities[i])} for i in order[:3]]}


class LandmarkModel:
    def __init__(self):
        self._lock = Lock()
        self._session = None
        self._attempted = False
        self.error = 'not_loaded'
        self.classes = {}

    def initialize(self):
        with self._lock:
            if self._attempted: return
            self._attempted = True
            try:
                if not MODEL_PATH.is_file() or not CLASSES_PATH.is_file():
                    raise ValueError('model_or_classes_missing')
                if hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest() != EXPECTED_SHA256:
                    raise ValueError('model_checksum_mismatch')
                classes = json.loads(CLASSES_PATH.read_text())
                if set(classes) != {str(i) for i in range(len(classes))} or set(classes.values()) != set(LANDMARKS):
                    raise ValueError('class_mapping_mismatch')
                import onnxruntime as ort
                options = ort.SessionOptions()
                options.intra_op_num_threads = 2
                session = ort.InferenceSession(str(MODEL_PATH), sess_options=options, providers=['CPUExecutionProvider'])
                if session.get_outputs()[0].shape[-1] != len(classes):
                    raise ValueError('output_class_count_mismatch')
                self.classes, self._session, self.error = classes, session, None
            except Exception as exc:
                self.error = type(exc).__name__ + ': ' + str(exc)[:100]
                logger.warning('Local landmark model unavailable: %s', self.error)

    def status(self):
        self.initialize()
        return {'available': self._session is not None, 'classes': len(self.classes),
                'enabledClasses': sum(row['localModelEnabled'] for row in LANDMARKS.values()),
                'sourceCommit': CATALOG['modelSourceCommit'], 'sha256': EXPECTED_SHA256, 'error': self.error}

    def predict(self, content):
        self.initialize()
        if self._session is None: return None
        try:
            with Image.open(io.BytesIO(content)) as source:
                if source.width * source.height > 25_000_000:
                    raise ValueError('Image exceeds 25 megapixels')
                image = ImageOps.exif_transpose(source).convert('RGB').resize((224, 224), Image.Resampling.BILINEAR)
                pixels = np.asarray(image, dtype=np.float32) / 255.0
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
            raise ValueError('Invalid image pixels') from exc
        normalized = (pixels - np.array([.485, .456, .406], dtype=np.float32)) / np.array([.229, .224, .225], dtype=np.float32)
        tensor = np.ascontiguousarray(normalized.transpose(2, 0, 1)[None], dtype=np.float32)
        logits = self._session.run(None, {self._session.get_inputs()[0].name: tensor})[0][0]
        return classify_logits(logits, self.classes,
                               float(os.getenv('LANDMARK_MIN_CONFIDENCE', '.70')),
                               float(os.getenv('LANDMARK_MIN_MARGIN', '.15')))

model = LandmarkModel()
