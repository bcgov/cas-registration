import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create a superuser with username and password'

    def handle(self, *args, **options):
        User = get_user_model()
        superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if superuser_username and superuser_password:
            User.objects.create_superuser(username=superuser_username, password=superuser_password)
            self.stdout.write(self.style.SUCCESS('Superuser created successfully'))
            return None

        self.stdout.write(self.style.ERROR('Superuser not created.'))
        raise Exception('Superuser not created.')
