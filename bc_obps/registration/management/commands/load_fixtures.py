import pathlib
from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load all fixtures in app directories'

    def handle(self, *args, **kwargs):
        cmd_args = list(pathlib.Path().glob('./registration/fixtures/*'))
        call_command('loaddata', *cmd_args)
