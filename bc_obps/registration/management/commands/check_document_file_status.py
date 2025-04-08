from django.core.management.base import BaseCommand
from registration.models import Document
from service.data_access_service.document_service import DocumentDataAccessService
import time

# Repeat the check every 45 seconds for 37 times, equalling a total of 27:45 minutes with 2:75 minutes for pod leeway
REPETITIONS = 37  # Number of times to repeat
REPEAT_DELAY = 45  # Delay between repeats in seconds


class Command(BaseCommand):
    help = (
        f"Check the status of the malware scans unscanned documents every {REPEAT_DELAY} seconds, {REPETITIONS} times"
    )

    def handle(self, *args, **kwargs):
        self.stdout.write(
            f"Starting check_document_file_status, checking every {REPEAT_DELAY} seconds for {REPETITIONS} times"
        )
        for attempt in range(1, REPETITIONS + 1):
            self.stdout.write("Checking status of malware scanning unscanned documents")

            try:
                unscanned_documents = Document.objects.filter(status=Document.FileStatus.UNSCANNED)
                for document in unscanned_documents:
                    DocumentDataAccessService.check_document_file_status(document)
                    self.stdout.write(f"Checking status of document id: {document.id}")
                self.stdout.write(self.style.SUCCESS(f"Checked {unscanned_documents.count()} documents"))
            except Exception as e:
                self.stdout.write(self.style.NOTICE(f"Error checking status of documents: {e}"))
                raise e

            if attempt < REPETITIONS:
                time.sleep(REPEAT_DELAY)  # Wait before retrying

        self.stdout.write("Completed check loop")
