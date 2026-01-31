import pytest
from common.models import EmailNotificationTemplate
from common.tests.email_snapshots.template_test_contexts import TEMPLATE_CONTEXTS
from service.data_access_service.email_template_service import EmailNotificationTemplateService


def _render_ches_template(body: str, context: dict) -> str:
    """
    Simulate CHES template variable substitution.
    CHES replaces both {{ var }} and {{var}} syntax.
    We use simple string replacement rather than Django's Template engine,
    because CHES — not Django — renders these templates in production.
    """
    for key, value in context.items():
        body = body.replace("{{ " + key + " }}", str(value))
        body = body.replace("{{" + key + "}}", str(value))
    return body


@pytest.mark.django_db
class TestEmailTemplateSnapshots:
    """
    Snapshot tests for all email templates.

    These tests ensure that any change to a template's subject or rendered body
    is caught and must be explicitly approved by updating the snapshots:
        pytest --snapshot-update
    """

    @pytest.mark.parametrize("template_name", TEMPLATE_CONTEXTS.keys())
    def test_template_body_snapshot(self, template_name, snapshot):
        template_instance = EmailNotificationTemplateService.get_template_by_name(template_name)
        context = TEMPLATE_CONTEXTS[template_name]
        rendered_body = _render_ches_template(template_instance.body, context)
        assert rendered_body == snapshot

    @pytest.mark.parametrize("template_name", TEMPLATE_CONTEXTS.keys())
    def test_template_subject_snapshot(self, template_name, snapshot):
        template_instance = EmailNotificationTemplateService.get_template_by_name(template_name)
        assert template_instance.subject == snapshot

    def test_all_templates_are_covered(self):
        """
        Ensures every template in the database has a corresponding entry
        in TEMPLATE_CONTEXTS. If a new template is added via migration
        but not registered here, this test fails.
        """
        all_db_templates = set(EmailNotificationTemplate.objects.values_list("name", flat=True))
        all_registered_templates = set(TEMPLATE_CONTEXTS.keys())
        missing = all_db_templates - all_registered_templates
        assert not missing, (
            "The following templates exist in the database but are not covered "
            "by snapshot tests. Add them to TEMPLATE_CONTEXTS in template_test_contexts.py:\n"
            + "\n".join("  - " + name for name in sorted(missing))
        )

    def test_no_stale_template_entries(self):
        """
        Ensures TEMPLATE_CONTEXTS doesn't reference templates that
        no longer exist in the database (e.g., after a template is removed).
        """
        all_db_templates = set(EmailNotificationTemplate.objects.values_list("name", flat=True))
        all_registered_templates = set(TEMPLATE_CONTEXTS.keys())
        stale = all_registered_templates - all_db_templates
        assert not stale, (
            "The following templates are in TEMPLATE_CONTEXTS but do not exist "
            "in the database. Remove them from template_test_contexts.py:\n"
            + "\n".join("  - " + name for name in sorted(stale))
        )
