"""Synthetic contract tests. No provider requests or real credentials are used."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
import sys
sys.path.insert(0, str(Path(__file__).parents[1]))

from fastapi import HTTPException
from fastapi.testclient import TestClient

spec = importlib.util.spec_from_file_location("travelai_detection", Path(__file__).parents[1] / "ai" / "main.py")
ai = importlib.util.module_from_spec(spec)
with patch("google.cloud.vision.ImageAnnotatorClient"), patch(
    "google.cloud.vision_v1.services.image_annotator.transports.ImageAnnotatorRestTransport"
):
    spec.loader.exec_module(ai)


class DetectionApiTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(ai.app)
        self.local_patch = patch.object(ai.landmark_model, "predict", return_value=None)
        self.local_patch.start()
        self.addCleanup(self.local_patch.stop)

    def upload(self, content=b"\xff\xd8\xffsynthetic", consent="true"):
        return self.client.post("/detect", files={"file": ("test.jpg", content, "image/jpeg")}, data={"consent": consent})

    def test_consent_required_before_provider_call(self):
        with patch.object(ai, "analyze_google") as provider:
            self.assertEqual(400, self.upload(consent="false").status_code)
            provider.assert_not_called()

    def test_empty_file_rejected_before_provider_call(self):
        with patch.object(ai, "analyze_google") as provider:
            self.assertEqual(400, self.upload(b"").status_code)
            provider.assert_not_called()

    def test_unsupported_file_rejected_before_provider_call(self):
        with patch.object(ai, "analyze_google") as provider:
            self.assertEqual(400, self.upload(b"not an image").status_code)
            provider.assert_not_called()

    def test_oversized_file_rejected_before_provider_call(self):
        with patch.object(ai, "analyze_google") as provider:
            self.assertEqual(413, self.upload(b"x" * (ai.MAX_IMAGE_SIZE + 1)).status_code)
            provider.assert_not_called()

    def test_unknown_result_remains_unknown(self):
        signals = dict(landmarks=[], entities=[], guesses=[], labels=[], objects=[], ocr="")
        with patch.object(ai, "analyze_google", return_value=signals) as provider:
            response = self.upload()
            self.assertEqual(200, response.status_code)
            self.assertEqual("unknown", response.json()["recognitionStatus"])
            self.assertFalse(response.json()["success"])
            provider.assert_called_once_with(b"\xff\xd8\xffsynthetic")

    def test_object_bounds_returned_from_provider(self):
        signals = dict(landmarks=[], entities=[], guesses=[], labels=[], ocr="", objects=[{
            "name": "Food", "score": 0.8,
            "bounds": [{"x": 0.1, "y": 0.2}, {"x": 0.7, "y": 0.8}]
        }])
        with patch.object(ai, "analyze_google", return_value=signals):
            response = self.upload()
        self.assertEqual(200, response.status_code)
        self.assertEqual(signals["objects"][0]["bounds"], response.json()["objectBounds"][0]["vertices"])

    def test_missing_configuration_is_service_error(self):
        with patch.object(ai, "vision_client", None):
            self.assertEqual(503, self.upload().status_code)

    def test_provider_failure_is_error_instead_of_unknown_result(self):
        with patch.object(ai.vision_client, "annotate_image", side_effect=RuntimeError("synthetic failure")):
            response = self.upload()
            self.assertEqual(502, response.status_code)
            self.assertNotIn("synthetic failure", response.text)

    def test_local_prediction_requires_cloud_confirmation_before_catalog_link(self):
        prediction = dict(code="cho_ben_thanh", confidence=.95, accepted=True, candidates=[])
        with patch.object(ai.landmark_model, "predict", return_value=prediction), patch.object(ai, "analyze_google", side_effect=HTTPException(503)):
            result = self.upload().json()
        self.assertEqual("predicted", result["recognitionStatus"])
        self.assertIsNone(result["landmarkCode"])
        self.assertEqual("onnx", result["engine"])

    def test_cloud_corroboration_resolves_landmark_code(self):
        prediction = dict(code="cho_ben_thanh", confidence=.95, accepted=True, candidates=[])
        signals = dict(landmarks=[dict(name="Chợ Bến Thành", score=.95, coordinates=None)], entities=[], guesses=[], labels=[], objects=[], ocr="")
        with patch.object(ai.landmark_model, "predict", return_value=prediction), patch.object(ai, "analyze_google", return_value=signals):
            result = self.upload().json()
        self.assertEqual("identified", result["recognitionStatus"])
        self.assertEqual("cho_ben_thanh", result["landmarkCode"])

    def test_ocr_corroborates_model(self):
        prediction = dict(code="cho_ben_thanh", confidence=.95, accepted=True, candidates=[])
        signals = dict(landmarks=[], entities=[], guesses=[], labels=[], objects=[], ocr="CHỢ BẾN THÀNH")
        with patch.object(ai.landmark_model, "predict", return_value=prediction), patch.object(ai, "analyze_google", return_value=signals):
            result = self.upload().json()
        self.assertEqual("identified", result["recognitionStatus"])
        self.assertEqual("cho_ben_thanh", result["landmarkCode"])

    def test_ocr_and_model_with_conflicting_cloud_stays_prediction(self):
        prediction = dict(code="cho_ben_thanh", confidence=.98, accepted=True, candidates=[])
        signals = dict(landmarks=[dict(name="Bảo tàng khác", score=.94, coordinates=None)], entities=[], guesses=[], labels=[], objects=[], ocr="CHỢ BẾN THÀNH")
        with patch.object(ai.landmark_model, "predict", return_value=prediction), patch.object(ai, "analyze_google", return_value=signals):
            result = self.upload().json()
        self.assertEqual("Chợ Bến Thành", result["displayName"])
        self.assertEqual("predicted", result["recognitionStatus"])
        self.assertIsNone(result["landmarkCode"])

    def test_cloud_result_outside_training_not_overwritten(self):
        prediction = dict(code="cau_long_bien", confidence=.95, accepted=True, candidates=[])
        signals = dict(landmarks=[], entities=[], guesses=[], labels=[], objects=[], ocr="")
        cloud = dict(exactName="Big Ben", displayName="Big Ben", category="place", recognitionStatus="predicted", description="Tháp đồng hồ", reason="Google", searchQuery=None, locationHint=None)
        with patch.object(ai.landmark_model, "predict", return_value=prediction), patch.object(ai, "analyze_google", return_value=signals), patch.object(ai, "fallback_analysis", return_value=cloud):
            result = self.upload().json()
        self.assertEqual("Big Ben", result["displayName"])
        self.assertEqual("google_vision", result["engine"])
        self.assertIsNone(result["landmarkCode"])

    def test_unconfirmed_model_does_not_replace_unknown_cloud(self):
        prediction = dict(code="cau_long_bien", confidence=.95, accepted=True, candidates=[])
        signals = dict(landmarks=[], entities=[], guesses=[], labels=[], objects=[], ocr="")
        with patch.object(ai.landmark_model, "predict", return_value=prediction), patch.object(ai, "analyze_google", return_value=signals):
            result = self.upload().json()
        self.assertEqual("unknown", result["recognitionStatus"])
        self.assertIsNone(result["landmarkCode"])

    def test_excluded_class_is_not_promoted(self):
        from ai.landmark_model import classify_logits
        classes = {str(i): name for i, name in enumerate(ai.LANDMARKS)}
        logits = [0.0] * len(classes)
        logits[list(classes.values()).index("cau_rong")] = 20.0
        result = classify_logits(logits, classes)
        self.assertFalse(result["accepted"])
        self.assertEqual("cau_rong", result["code"])

    def test_allowed_web_origin_preflight(self):
        for origin in ("http://localhost:8081", "http://localhost:8084", "http://127.0.0.1:8084"):
            with self.subTest(origin=origin):
                response = self.client.options("/detect", headers={"Origin": origin, "Access-Control-Request-Method": "POST"})
                self.assertEqual(200, response.status_code)
                self.assertEqual(origin, response.headers["access-control-allow-origin"])

    def test_unapproved_web_origin_is_rejected(self):
        response = self.client.options("/detect", headers={"Origin": "https://example.invalid", "Access-Control-Request-Method": "POST"})
        self.assertEqual(400, response.status_code)

    def test_place_summary_returns_only_verified_vietnamese_article(self):
        article = {"title": "Synthetic", "description": "Synthetic description", "url": "https://vi.wikipedia.org/wiki/Synthetic", "language": "vi"}
        with patch.object(ai, "wikipedia_lookup", return_value=article):
            response = self.client.get("/places/summary", params={"name": "Synthetic"})
        self.assertEqual(200, response.status_code)
        self.assertTrue(response.json()["found"])
        with patch.object(ai, "wikipedia_lookup", return_value={**article, "language": "en"}):
            self.assertFalse(self.client.get("/places/summary", params={"name": "Synthetic"}).json()["found"])


if __name__ == "__main__":
    unittest.main()
