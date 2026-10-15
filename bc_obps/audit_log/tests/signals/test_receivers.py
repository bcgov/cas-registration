import pytest
from django.db import transaction
from model_bakery import baker

from audit_log.models import AuditLog
from registration.models import Operation

pytestmark = pytest.mark.django_db


class TestHandlePostCreateHistoricalRecordCoalescing:
    """
    A single logical edit to an Operation can trigger django-simple-history's
    post_create_historical_record signal more than once -- a plain field save and a watched
    M2M field's `.set()` (e.g. regulated_products) each fire it independently, even within one
    `@transaction.atomic()` service call. These must still coalesce into a single AuditLog row
    per transaction, not one row per underlying historical record.
    """

    def test_creating_an_operation_produces_one_row(self, django_capture_on_commit_callbacks):
        with django_capture_on_commit_callbacks(execute=True):
            operation = baker.make_recipe("registration.tests.utils.operation")

        entries = AuditLog.objects.filter(entity_type="operation", entity_id=str(operation.id))

        assert entries.count() == 1
        assert entries.first().action == AuditLog.Action.CREATE

    def test_field_update_and_m2m_change_in_same_transaction_produce_one_row(self, django_capture_on_commit_callbacks):
        with django_capture_on_commit_callbacks(execute=True):
            operation = baker.make_recipe("registration.tests.utils.operation")
        product = baker.make_recipe("registration.tests.utils.regulated_product")

        with django_capture_on_commit_callbacks(execute=True):
            with transaction.atomic():
                operation.name = "Renamed Operation"
                operation.save()
                operation.regulated_products.set([product])

        update_entries = AuditLog.objects.filter(
            entity_type="operation", entity_id=str(operation.id), action=AuditLog.Action.UPDATE
        )

        assert update_entries.count() == 1
        entry = update_entries.first()
        assert set(entry.changed_fields) == {"name", "regulated_products"}
        assert entry.snapshot["name"]["value"] == "Renamed Operation"
        assert entry.snapshot["regulated_products"]["value"] == [product.name]

    def test_registration_purpose_change_cascading_to_m2m_stays_one_row(self, django_capture_on_commit_callbacks):
        """
        Mirrors the real-world case that motivated this: changing an Operation's registration
        purpose can cascade into clearing its regulated products in the same request. Both must
        land as one audit log row, not two.
        """
        with django_capture_on_commit_callbacks(execute=True):
            operation = baker.make_recipe(
                "registration.tests.utils.operation",
                registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
            )
            product = baker.make_recipe("registration.tests.utils.regulated_product")
            operation.regulated_products.set([product])

        entries_before = set(
            AuditLog.objects.filter(entity_type="operation", entity_id=str(operation.id)).values_list("id", flat=True)
        )

        with django_capture_on_commit_callbacks(execute=True):
            with transaction.atomic():
                operation.registration_purpose = Operation.Purposes.REPORTING_OPERATION
                operation.save()
                operation.regulated_products.set([])

        new_entries = AuditLog.objects.filter(entity_type="operation", entity_id=str(operation.id)).exclude(
            id__in=entries_before
        )

        assert new_entries.count() == 1
        entry = new_entries.first()
        assert set(entry.changed_fields) == {"registration_purpose", "regulated_products"}
        assert entry.snapshot["registration_purpose"]["value"] == Operation.Purposes.REPORTING_OPERATION
        assert entry.snapshot["regulated_products"]["value"] == []
