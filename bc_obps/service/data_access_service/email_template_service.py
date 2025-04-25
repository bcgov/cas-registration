from common.models import EmailNotificationTemplate
from enum import Enum


class EmailNotificationTemplateService:
    @classmethod
    def get_template_by_name(cls, template_name: str | Enum) -> EmailNotificationTemplate:
        """
        Get an email notification template by its name.

        Args:
            template_name: The name of the template to get.

        Returns:
            EmailNotificationTemplate or None
        """
        if isinstance(template_name, str):
            template_name_str = template_name
        elif isinstance(template_name, Enum):
            template_name_str = template_name.value
        else:
            raise TypeError("template_name must be a string or Enum")
        try:
            return EmailNotificationTemplate.objects.get(name=template_name_str)
        except EmailNotificationTemplate.DoesNotExist:
            raise ValueError("Email template not found")
