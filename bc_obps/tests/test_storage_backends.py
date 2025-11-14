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
