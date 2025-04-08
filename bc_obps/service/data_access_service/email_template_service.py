from common.models import EmailNotificationTemplate
from registration.enums.enums import EmailTemplateNames


class EmailNotificationTemplateService:
    @classmethod
    def get_template_by_name(cls, template_name: EmailTemplateNames | str) -> EmailNotificationTemplate:
        """
        Get an email notification template by its name.

        Args:
            template_name: The name of the template to get.

        Returns:
            EmailNotificationTemplate or None
        """
        template_name_str = template_name if type(template_name) == str else template_name.value
        try:
            return EmailNotificationTemplate.objects.get(name=template_name_str)
        except EmailNotificationTemplate.DoesNotExist:
            raise ValueError("Email template not found")
