from django.conf import settings
from storages.backends.gcloud import GoogleCloudStorage  # type: ignore

# FIXME: Need to stop class redefinitions
# If we're in the CI environment, don't hit Google Cloud Storage
if os.environ.get("CI", None) == "true":
    class LocalStorage(FileSystemStorage):
        location = settings.MEDIA_ROOT

        def url(self, name):
            name = os.path.join(self.location, name)
            return super().url(name)

    class UnscannedBucketStorage(LocalStorage):
        location = os.path.join(settings.MEDIA_ROOT, "unscanned")

    class CleanBucketStorage(LocalStorage):
        location = os.path.join(settings.MEDIA_ROOT, "clean")

    class QuarantinedBucketStorage(LocalStorage):
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
