import pytest
from registration.models import User, AppRole
import uuid
from django.db import connection

@pytest.fixture(scope="session", autouse=True)
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        with connection.cursor() as cursor:
            user = User.objects.create(
                user_guid=uuid.uuid4(),
                business_guid=uuid.uuid4(),
                bceid_business_name='Default User Business',
                app_role=AppRole.objects.get(role_name='industry_user'),
                first_name='Default',
                last_name='Test User',
                email='defaultuser@example.com',
                position_title='Default User',
                phone_number='+16044011234'
            )
            cursor.execute('set my.guid = %s', [str(user.user_guid)])
