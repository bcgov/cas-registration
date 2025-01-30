import pytest
from model_bakery import baker
from django.db import connection
from registration.models import Operator

pytestmark = pytest.mark.django_db

class TestTimeStampedModel:
    @staticmethod
    def test_create_update_audit_fields():
        # Create a timestamped table (operator)
        operator = baker.make_recipe(
            'utils.operator',
        )

        # Update a timestamped table (operator)
        Operator.objects.filter(
            id=operator.id,
        ).update(trade_name='CHANGED')

        # Refresh from DB
        operator.refresh_from_db()

        # Tests
        with connection.cursor() as cursor:
            cursor.execute("select current_setting('my.guid')")
            x = cursor.fetchone()
            assert str(operator.created_by_id) == x[0]
            assert str(operator.updated_by_id) == x[0]

        assert operator.created_at is not None
        assert operator.updated_at is not None
