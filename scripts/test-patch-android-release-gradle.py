#!/usr/bin/env python3
"""Unit tests for scripts/patch-android-release-gradle.py."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "patch-android-release-gradle.py"

SAMPLE_PREBUILD_GRADLE = """\
android {
    namespace 'com.anonymous.travelai'
    defaultConfig {
        applicationId 'com.anonymous.travelai'
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug
            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'
        }
    }
}
"""


class PatchAndroidReleaseGradleTest(unittest.TestCase):
    def _run(self, gradle_path: Path, version_code: str, version_name: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            [sys.executable, str(SCRIPT), str(gradle_path), version_code, version_name],
            capture_output=True,
            text=True,
            check=False,
        )

    def test_patches_fresh_prebuild_gradle(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "build.gradle"
            p.write_text(SAMPLE_PREBUILD_GRADLE, encoding="utf-8")

            res = self._run(p, "20101", "2.1.1")
            self.assertEqual(res.returncode, 0, res.stderr)

            out = p.read_text(encoding="utf-8")
            self.assertIn("versionCode 20101", out)
            self.assertIn('versionName "2.1.1"', out)
            self.assertIn("travelaiReleaseStoreFile", out)
            self.assertIn(
                "signingConfig project.hasProperty('travelaiReleaseStoreFile') ? signingConfigs.release : signingConfigs.debug",
                out,
            )

    def test_idempotent_on_second_run(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "build.gradle"
            p.write_text(SAMPLE_PREBUILD_GRADLE, encoding="utf-8")

            r1 = self._run(p, "20101", "2.1.1")
            self.assertEqual(r1.returncode, 0, r1.stderr)
            r2 = self._run(p, "20200", "2.2.0")
            self.assertEqual(r2.returncode, 0, r2.stderr)

            out = p.read_text(encoding="utf-8")
            self.assertIn("versionCode 20200", out)
            self.assertIn('versionName "2.2.0"', out)
            self.assertEqual(out.count("storeFile file(project.property('travelaiReleaseStoreFile'))"), 1)

    def test_rejects_invalid_version_code(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "build.gradle"
            p.write_text(SAMPLE_PREBUILD_GRADLE, encoding="utf-8")

            res = self._run(p, "0", "2.1.1")
            self.assertNotEqual(res.returncode, 0)

    def test_rejects_missing_version_fields(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "build.gradle"
            p.write_text("android { }", encoding="utf-8")

            res = self._run(p, "20101", "2.1.1")
            self.assertNotEqual(res.returncode, 0)


if __name__ == "__main__":
    unittest.main()
