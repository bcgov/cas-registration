from itertools import chain
from typing import Iterable
from common.models.scanned_file_storage_mixin import ScannedFileStorageMixin
from django.core.management.base import BaseCommand
from registration.models import Document
import time
from reporting.models.report_attachment import ReportAttachment


class Command(BaseCommand):
    help = "Check the status of the malware scans unscanned documents every -d seconds, -r times. Accounts for processing time."

    def add_arguments(self, parser):
        parser.add_argument(
            "-r",
            "--repetitions",
            type=int,
            help="Number of times to repeat the check",
            default=5,
        )
        parser.add_argument(
            "-d",
            "--repeat-delay",
            type=int,
            help="Delay between scans in seconds",
            default=1,
        )

    def handle(self, *args, **options):
        if options["repetitions"] < 1:
            raise ValueError("repetitions must be greater than 0")
        if options["repeat_delay"] < 1:
            raise ValueError("repeat-delay must be greater than 0")

        REPETITIONS = options["repetitions"]
        REPEAT_DELAY = options["repeat_delay"]
        self.stdout.write(
            f"Starting check_document_file_status, checking every {REPEAT_DELAY} second(s) for {REPETITIONS} times"
        )
        start_time = int(time.time())
        iteration = 0

        while iteration < REPETITIONS:
            self.stdout.write(f"Iteration {iteration + 1} of {REPETITIONS}")
            # compute sleep duration (first iteration happens at start_time)
            next_attempt_time = start_time + iteration * REPEAT_DELAY
            sleep_duration = next_attempt_time - int(time.time())
            self.stdout.write(f"Next check is in {sleep_duration} second(s).")

            # move to next iteration
            iteration = iteration + 1

            # skip next iteration if we spent too much time on the previous iteration
            if sleep_duration < 0:
                continue

            # wait the appropriate amount of time
            time.sleep(sleep_duration)

            try:
                unscanned_models: Iterable[ScannedFileStorageMixin] = chain(
                    Document.objects.filter(status=ScannedFileStorageMixin.FileStatus.UNSCANNED).iterator(),
                    ReportAttachment.objects.filter(status=ScannedFileStorageMixin.FileStatus.UNSCANNED).iterator(),
                )

                counter = 0
                for model in unscanned_models:
                    counter += 1
                    self.stdout.write(f"Checking status of model {model._meta.object_name} with id: {model.id}")
                    model.sync_file_status()

                self.stdout.write(self.style.SUCCESS(f"Checked {counter} documents"))

            except Exception as e:
                self.stdout.write(self.style.NOTICE(f"Error checking status of documents: {e}"))
                raise e

        self.stdout.write("Completed check loop")
