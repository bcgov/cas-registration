from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load fixtures for specified workflow or all fixtures if no argument provided'

    def add_arguments(self, parser):
        parser.add_argument('workflow', nargs='?', type=str, help='Name of the workflow')

    def handle(self, *args, **options):
        fixture_base_dir = 'registration/fixtures/mock/v1'
        fixtures_base = [  # Order of fixtures is important
            f'{fixture_base_dir}/address.json',
            f'{fixture_base_dir}/user.json',
            f'{fixture_base_dir}/contact.json',
            f'{fixture_base_dir}/bc_obps_regulated_operation.json',
            f'{fixture_base_dir}/bc_greenhouse_gas_id.json',
            f'{fixture_base_dir}/operator.json',
            f'{fixture_base_dir}/operation.json',
            f'{fixture_base_dir}/multiple_operator.json',
            f'{fixture_base_dir}/document.json',
            f'{fixture_base_dir}/user_operator.json',
            f'{fixture_base_dir}/parent_operator.json',
            f'{fixture_base_dir}/partner_operator.json',
        ]

        workflow_fixtures = {
            "cas_admin": [
                f'{fixture_base_dir}/address.json',
                f'{fixture_base_dir}/user.json',
                f'{fixture_base_dir}/contact.json',
                f'{fixture_base_dir}/bc_obps_regulated_operation.json',
                f'{fixture_base_dir}/bc_greenhouse_gas_id.json',
                f'{fixture_base_dir}/operator.json',
                f'{fixture_base_dir}/operation.json',
                f'{fixture_base_dir}/user_operator.json',
            ],
            "admin-industry_user": [
                (
                    fixture.replace('v1/user_operator.json', 'admin/user_operator.json')
                    if 'user_operator.json' in fixture
                    else fixture
                )
                for fixture in fixtures_base
            ],
            "admin-industry_user_operator": [
                (
                    fixture.replace('v1/user_operator.json', 'admin/user_operator_approved.json')
                    if 'user_operator.json' in fixture
                    else fixture
                )
                for fixture in fixtures_base
            ],
            # Add more workflows here
        }

        if 'workflow' in options and options['workflow'] in workflow_fixtures:
            fixtures = workflow_fixtures[options['workflow']]
        else:
            # If no workflow specified, load all fixtures

            fixtures = fixtures_base

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
