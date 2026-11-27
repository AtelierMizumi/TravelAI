#!/usr/bin/env python3
"""Patch Expo-generated android/app/build.gradle with release version and signingConfig.

Usage:
    patch-android-release-gradle.py <build.gradle> <versionCode> <versionName>
"""

import re
import sys
from pathlib import Path

RELEASE_SIGNING_BLOCK = """\
        release {
            if (project.hasProperty('travelaiReleaseStoreFile')) {
                storeFile file(project.property('travelaiReleaseStoreFile'))
                storePassword project.property('travelaiReleaseStorePassword')
                keyAlias project.property('travelaiReleaseKeyAlias')
                keyPassword project.property('travelaiReleaseKeyPassword')
            }
        }"""

RELEASE_SIGNING_EXPR = (
    "signingConfig project.hasProperty('travelaiReleaseStoreFile') "
    "? signingConfigs.release : signingConfigs.debug"
)


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        print(f"Usage: {argv[0]} <build.gradle> <versionCode> <versionName>", file=sys.stderr)
        return 2

    gradle_path = Path(argv[1])
    raw_code = argv[2]
    version_name = argv[3]

    if not raw_code.isdigit() or int(raw_code) <= 0:
        print(f"versionCode must be a positive integer, got: {raw_code!r}", file=sys.stderr)
        return 1
    if not version_name.strip():
        print("versionName must not be empty", file=sys.stderr)
        return 1
    if not gradle_path.is_file():
        print(f"build.gradle not found: {gradle_path}", file=sys.stderr)
        return 1

    text = gradle_path.read_text(encoding="utf-8")

    text, code_count = re.subn(r"\bversionCode\s+\d+", f"versionCode {int(raw_code)}", text, count=1)
    text, name_count = re.subn(r'\bversionName\s+"[^"]*"', f'versionName "{version_name}"', text, count=1)
    if code_count != 1 or name_count != 1:
        print("Could not locate versionCode / versionName in build.gradle", file=sys.stderr)
        return 1

    if "travelaiReleaseStoreFile" not in text:
        debug_block = re.search(
            r"(signingConfigs\s*\{\s*debug\s*\{[^}]*\})",
            text,
            flags=re.DOTALL,
        )
        if not debug_block:
            print("Could not locate signingConfigs.debug block in build.gradle", file=sys.stderr)
            return 1
        insert_at = debug_block.end()
        text = text[:insert_at] + "\n" + RELEASE_SIGNING_BLOCK + text[insert_at:]

        release_type = re.search(
            r"(buildTypes\s*\{.*?release\s*\{[^}]*?)signingConfig\s+signingConfigs\.debug",
            text,
            flags=re.DOTALL,
        )
        if not release_type:
            print("Could not locate buildTypes.release signingConfig in build.gradle", file=sys.stderr)
            return 1
        text = (
            text[: release_type.start()]
            + release_type.group(1)
            + RELEASE_SIGNING_EXPR
            + text[release_type.end() :]
        )

    gradle_path.write_text(text, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
