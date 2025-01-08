from django.core.management.base import BaseCommand
from service.transfer_event_service import TransferEventService

class Command(BaseCommand):
    help = 'Process all due transfer events'

    def handle(self, *args, **kwargs):
        self.stdout.write('Processing due transfer events...')
        try:
            TransferEventService.process_due_transfer_events()
            self.stdout.write(self.style.SUCCESS('Successfully processed due transfer events'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error processing due transfer events: {e}'))
            raise e