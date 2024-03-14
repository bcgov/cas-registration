from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load all fixtures in app directories'

    def handle(self, *args, **options):
        fixture_dir = 'registration/fixtures/mock'
        # Order of fixtures is important
        fixtures = [
            f'{fixture_dir}/address.json',
            f'{fixture_dir}/user.json',
            f'{fixture_dir}/contact.json',
            f'{fixture_dir}/bc_obps_regulated_operation.json',
            f'{fixture_dir}/operator.json',
            f'{fixture_dir}/operation.json',
            f'{fixture_dir}/document.json',
            f'{fixture_dir}/user_operator.json',
            f'{fixture_dir}/parent_operator.json',
        ]
        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
