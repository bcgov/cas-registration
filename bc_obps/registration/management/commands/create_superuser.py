import os
from django.conf import settings
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Create a superuser with username and password'

    def handle(self, *args, **options):
        User = get_user_model()
        if settings.DEBUG:
            superuser_username = os.environ.get('SUPERUSER_USERNAME')
            superuser_password = os.environ.get('SUPERUSER_PASSWORD')
            if not superuser_username or not superuser_password:
                call_command('createsuperuser')
            else:
                User.objects.create_superuser(username=superuser_username, password=superuser_password)
