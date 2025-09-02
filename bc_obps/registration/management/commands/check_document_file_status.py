from itertools import chain
import logging
import sys
from typing import Iterable
from common.management.commands.custom_migrate import has_unapplied_migrations
from common.models.scanned_file_storage_mixin import ScannedFileStorageMixin
from django.core.management.base import BaseCommand
from registration.models import Document
import time
from reporting.models.report_attachment import ReportAttachment
from service.error_service.handle_exception import ExceptionHandler

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Check the status of the malware scans unscanned documents every -d seconds, -r times. Accounts for processing time."

    def add_arguments(self, parser):
        parser.add_argument(
            "-r",
            "--repetitions",
            type=int,
            help="Number of times to repeat the check. Runs indefinitely if set to 0.",
            default=5,
        )
        parser.add_argument(
            "-d",
            "--repeat-delay",
            type=int,
            help="Delay between scans in seconds.",
            default=30,
        )

    def handle(self, *args, **options):
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s %(levelname)s %(message)s",
            stream=sys.stdout,
        )
        try:
            # Check to see if migrations have been applied before running the command
            if has_unapplied_migrations():
                logger.info("Waiting for migrations to be applied...")
                wait_start = time.time()
                timeout = 900

                while has_unapplied_migrations():
                    if time.time() - wait_start > timeout:
                        raise Exception("Timed out waiting for migrations to be applied.")
                    time.sleep(10)
                    logger.info(".")

                logger.info("Migrations have been applied.")

            if options["repeat_delay"] < 1:
                raise ValueError("repeat-delay must be greater than 0")

            REPETITIONS = options["repetitions"]
            REPEAT_DELAY = options["repeat_delay"]

            logger.info("Starting check_document_file_status")
            RUN_FOREVER = False
            if REPETITIONS == 0:
                RUN_FOREVER = True
                logger.info(f"Running indefinitely with a delay of {REPEAT_DELAY} seconds between checks")
            else:
                logger.info(f"Will run {REPETITIONS} times with a delay of {REPEAT_DELAY} seconds between checks")

            start_time = int(time.time())
            iteration = 0

            while RUN_FOREVER or iteration < REPETITIONS:
                if RUN_FOREVER:
                    logger.info(f"Iteration {iteration + 1} (running indefinitely)")
                else:
                    logger.info(f"Iteration {iteration + 1} of {REPETITIONS}")
                # compute sleep duration (first iteration happens at start_time)
                next_attempt_time = start_time + iteration * REPEAT_DELAY
                sleep_duration = next_attempt_time - int(time.time())
                logger.info(f"Next check is in {sleep_duration} second(s).")

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
                        logger.info(f"Checking status of model {model._meta.object_name} with id: {model.id}")
                        model.sync_file_status()

                    logger.info(self.style.SUCCESS(f"Checked {counter} documents"))

                except Exception as e:
                    logger.warning(self.style.NOTICE(f"Error checking status of documents: {e}"))
                    ExceptionHandler.capture_sentry_exception(e, "document_file_status_error")
                    raise e

            logger.info("Completed check loop")
        except Exception as e:
            logger.error(f"Unhandled error: {e}", exc_info=True)
            ExceptionHandler.capture_sentry_exception(e, "document_file_status_error")
            raise e
