import os
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from storages.backends.gcloud import GoogleCloudStorage  # type: ignore

# If we're in the CI environment, don't hit Google Cloud Storage
if settings.CI == "true" or settings.ENVIRONMENT == "local":

    class UnscannedLocal(FileSystemStorage):
        location = os.path.join(settings.MEDIA_ROOT, "unscanned")

    class CleanLocal(FileSystemStorage):
        location = os.path.join(settings.MEDIA_ROOT, "clean")

    class QuarantinedLocal(FileSystemStorage):
        location = os.path.join(settings.MEDIA_ROOT, "quarantine")

else:

    class UnscannedBucketStorage(GoogleCloudStorage):
        """A storage backend for the unscanned bucket."""

        bucket_name = settings.GS_UNSCANNED_BUCKET_NAME

    class CleanBucketStorage(GoogleCloudStorage):
        """A storage backend for the clean bucket."""

        bucket_name = settings.GS_CLEAN_BUCKET_NAME

    class QuarantinedBucketStorage(GoogleCloudStorage):
        """A storage backend for the quarantined bucket."""

        bucket_name = settings.GS_QUARANTINED_BUCKET_NAME
