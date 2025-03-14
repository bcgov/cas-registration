from django.core.management.base import BaseCommand
from registration.models import Document

from service.data_access_service.document_service_v2 import DocumentDataAccessServiceV2


class Command(BaseCommand):
    help = "Check the status of the malware scans unscanned documents"

    def handle(self, *args, **kwargs):
        self.stdout.write("Checking status of malware scanning unscanned documents")

        try:
            unscanned_documents = Document.objects.filter(status=Document.FileStatus.UNSCANNED)
            for document in unscanned_documents:
                DocumentDataAccessServiceV2.check_document_file_status(document)
                self.stdout.write(f"Checking status of document {document.id}")
        except Exception as e:
            self.stdout.write(f"Error checking status of documents: {e}")
            raise e
