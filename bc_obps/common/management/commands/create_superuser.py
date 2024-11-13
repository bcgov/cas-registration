import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import IntegrityError


class Command(BaseCommand):
    help = 'Create a superuser with username and password'

    def handle(self, *args, **options):
        User = get_user_model()
        superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if superuser_username and superuser_password:
            try:
                User.objects.create_superuser(username=superuser_username, password=superuser_password)
                self.stdout.write(self.style.SUCCESS('Superuser created successfully'))
                return None
            except IntegrityError:
                self.stdout.write(self.style.ERROR('Superuser already exists.'))
                return None
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'An error occurred while creating the superuser: {str(e)}'))
                return None

        self.stdout.write(self.style.ERROR('Superuser credentials not found.'))
        raise Exception('Superuser credentials not found.')
