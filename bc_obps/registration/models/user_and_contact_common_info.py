from common.models import BaseModel
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class UserAndContactCommonInfo(BaseModel):
    first_name = models.CharField(max_length=1000, db_comment="A user or contact's first name")
    last_name = models.CharField(max_length=1000, db_comment="A user or contact's last name")
    position_title = models.CharField(max_length=1000, db_comment="A user or contact's position title")
    email = models.EmailField(max_length=254, db_comment="A user or contact's email, limited to valid emails")
    phone_number = PhoneNumberField(
        blank=True,
        db_comment="A user or contact's phone number, limited to valid phone numbers",
    )

    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for users and contacts."

    def get_full_name(self) -> str:
        print('in this')
        """
        Return the full name of the user or contact.
        """
        return f"{self.first_name} {self.last_name}"
