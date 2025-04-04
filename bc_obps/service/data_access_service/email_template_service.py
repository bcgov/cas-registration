from common.models import EmailNotificationTemplate
from registration.enums.enums import EmailTemplateNames


class EmailNotificationTemplateService:
    @classmethod
    def get_template_by_name(cls, template_name: EmailTemplateNames | str) -> EmailNotificationTemplate:
        """
        Get an email notification template by its name.

        Args:
            template_name (str): The name of the template to get.

        Returns:
            EmailNotificationTemplate or None
        """
        try:
            return EmailNotificationTemplate.objects.get(name=template_name)
        except EmailNotificationTemplate.DoesNotExist:
            raise ValueError("Email template not found")
