from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile, UploadedFile


def create_test_file(name: str) -> UploadedFile:
    return InMemoryUploadedFile(ContentFile(b"file_content", name=name), None, name, None, 12, "utf-8")
