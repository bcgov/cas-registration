This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: bc_obps/tests/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
bc_obps/
  tests/
    conftest.py
    test_storage_backends.py
```

# Files

## File: bc_obps/tests/conftest.py
```python
import pytest
from common.tests.utils.helpers import set_db_user_guid_for_tests
from rls.utils.manager import RlsManager


@pytest.fixture(scope='class', autouse=True)
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        RlsManager.re_apply_rls()
        set_db_user_guid_for_tests()


@pytest.fixture(autouse=True)
def modify_settings(settings):
    # Remove silk and django_extensions from installed apps and middleware during tests
    settings.INSTALLED_APPS = [app for app in settings.INSTALLED_APPS if app not in ['silk', 'django_extensions']]
    settings.MIDDLEWARE = [mw for mw in settings.MIDDLEWARE if mw != 'silk.middleware.SilkyMiddleware']
```

## File: bc_obps/tests/test_storage_backends.py
```python
import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from bc_obps.storage_backends import SimpleLocal, UnifiedGcsStorage, add_filename_suffix, keep_deleted_items
from django.conf import settings
from django.test import SimpleTestCase


class TestStorageBackends(SimpleTestCase):
    def test_add_file_suffix(self):
        # Adds _copy by default
        with patch("bc_obps.storage_backends.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(2000, 1, 1)
            assert add_filename_suffix("test/case/test_file.ext") == "test/case/test_file_20000101000000.ext"

        # Replaces timestamp if there is already one
        with patch("bc_obps.storage_backends.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(3333, 12, 12)
            assert (
                add_filename_suffix("test/case/test_file_20000101000000.ext")
                == "test/case/test_file_33331212000000.ext"
            )

        # Allows to specify a suffix
        assert add_filename_suffix("case/test/file_test.txe", "suffix") == "case/test/file_testsuffix.txe"

        # Empty cases don't break
        assert add_filename_suffix("f", "") == "f"
        assert add_filename_suffix("", "") == ""

    def test_keep_deleted_items(self):

        test_storage = MagicMock()
        delete_method = test_storage.delete

        keep_deleted_items(test_storage)

        test_storage.delete("something")
        delete_method.assert_not_called()


class TestSimpleLocalStorageBackend(SimpleTestCase):
    def test_duplicate_file(self):
        storage_backend_under_test = SimpleLocal()
        storage_backend_under_test.location = "test/location"

        with patch("shutil.copy2") as mock_copy, patch("bc_obps.storage_backends.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(2001, 1, 1)

            return_value = storage_backend_under_test.duplicate_file("path/test_file.abc")
            mock_copy.assert_called_once_with(
                "test/location/path/test_file.abc",
                "test/location/path/test_file_20010101000000.abc",
            )
            assert return_value == "path/test_file_20010101000000.abc"


class TestUnifiedGcsStorage(SimpleTestCase):
    @patch("bc_obps.storage_backends.GoogleCloudStorage")
    def test_duplicate_file(self, mock_gcs):
        settings.GS_UNSCANNED_BUCKET_NAME = "unscanned"
        settings.GS_QUARANTINED_BUCKET_NAME = "quarantine"
        settings.GS_CLEAN_BUCKET_NAME = "clean"

        gcs_instance = MagicMock()
        gcs_instance.bucket.copy_blob.return_value = SimpleNamespace(name="test_return_value")
        mock_gcs.return_value = gcs_instance

        storage_backend_under_test = UnifiedGcsStorage()

        with patch("bc_obps.storage_backends.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(2002, 2, 22)
            return_value = storage_backend_under_test.duplicate_file("path/test_file.abc")

        assert return_value == "test_return_value"
        gcs_instance.bucket.copy_blob.assert_called_once()
        assert gcs_instance.bucket.copy_blob.mock_calls[0].args[2] == "path/test_file_20020222000000.abc"
```
