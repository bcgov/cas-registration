from django.core.management.base import BaseCommand
from registration.models import Document
from service.data_access_service.document_service import DocumentDataAccessService
import time

# Repeat the check every 30 seconds for 59 times, equalling a total of 29:30 minutes with 30 seconds for pod leeway
REPETITIONS = 59  # Number of times to repeat
REPEAT_DELAY = 30  # Delay between scans in seconds


class Command(BaseCommand):
    help = f"Check the status of the malware scans unscanned documents every {REPEAT_DELAY} seconds, {REPETITIONS} times. Accounts for processing time"

    def handle(self, *args, **kwargs):
        self.stdout.write(
            f"Starting check_document_file_status, checking every {REPEAT_DELAY} seconds for {REPETITIONS} times"
        )
        start_time = int(time.time())
        iteration = 0
        print(f"start_time: {start_time}")
        while iteration <= REPETITIONS:
            print(f"Iteration {iteration}")
            # compute sleep duration (first iteration happens at start_time)
            next_attempt_time = start_time + iteration * REPEAT_DELAY
            sleep_duration = next_attempt_time - int(time.time())
            print(
                f"Current is {int(time.time())}, next attempt is {next_attempt_time}, sleep_duration is {sleep_duration}"
            )

            # move to next iteration
            iteration = iteration + 1

            # skip next iteration if we spent too much time on the previous iteration
            if sleep_duration < 0:
                continue

            # wait the appropriate amount of time
            time.sleep(sleep_duration)

            try:
                unscanned_documents = Document.objects.filter(status=Document.FileStatus.UNSCANNED)
                for document in unscanned_documents:
                    DocumentDataAccessService.check_document_file_status(document)
                    self.stdout.write(f"Checking status of document id: {document.id}")
                self.stdout.write(self.style.SUCCESS(f"Checked {unscanned_documents.count()} documents"))
            except Exception as e:
                self.stdout.write(self.style.NOTICE(f"Error checking status of documents: {e}"))
                raise e

        self.stdout.write("Completed check loop")
