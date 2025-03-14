from django.conf import settings
from storages.backends.gcloud import GoogleCloudStorage  # type: ignore


class UnscannedBucketStorage(GoogleCloudStorage):
    """A storage backend for the unscanned bucket."""

    bucket_name = settings.GS_UNSCANNED_BUCKET_NAME


class CleanBucketStorage(GoogleCloudStorage):
    """A storage backend for the clean bucket."""

    bucket_name = settings.GS_CLEAN_BUCKET_NAME


class QuarantinedBucketStorage(GoogleCloudStorage):
    """A storage backend for the quarantined bucket."""

    bucket_name = settings.GS_QUARANTINED_BUCKET_NAME
