from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load fixtures for specified test data'

    def handle(self, *args, **options):
        fixture_base_dir = 'registration/fixtures/test'
        fixtures = [  # Order of fixtures is important
            f'{fixture_base_dir}/address.json',
            f'{fixture_base_dir}/contact.json',
            f'{fixture_base_dir}/user.json',
            f'{fixture_base_dir}/bc_obps_regulated_operation.json',
            f'{fixture_base_dir}/bc_greenhouse_gas_id.json',
            f'{fixture_base_dir}/operator.json',
            f'{fixture_base_dir}/operation.json',
            f'{fixture_base_dir}/operation_designated_operator_timeline.json',
        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
