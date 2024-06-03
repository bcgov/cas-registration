from registration.models import BaseModel
from django.db import models


class ReportingField(BaseModel):
    """Conditional Reporting Fields"""

    # No history needed, these elements are immutable
    field_name = models.CharField(max_length=1000, db_comment="Name of field needed for the related configuration element.")
    field_type = models.CharField(max_length=1000, db_comment="Type definition for field.")

    def serialize(self):
        return {
            "fieldName": self.field_name,
            "fieldType": self.field_type
        }

    class Meta:
        db_table_comment = "A field name/type combination that relates to a configuration element record through the config_element_reporting_field intersection table. Used to dynamically create a form schema from the configuration"
        db_table = 'erc"."reporting_field'
