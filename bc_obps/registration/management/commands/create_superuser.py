import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create a superuser with username and password'

    def handle(self, *args, **options):
        User = get_user_model()
        superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if superuser_username and superuser_password:
            User.objects.create_superuser(username=superuser_username, password=superuser_password)
        else:
            if settings.DEBUG:  # we don't want to call this in production
                call_command('createsuperuser')
