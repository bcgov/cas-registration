from django.db import models
from django.utils.translation import gettext as _


class SerialField(models.Field):
    description = _("BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE")

    empty_strings_allowed = False

    default_error_messages = {
        'invalid': _("'%(value)s' value must be an integer."),
    }

    def __init__(self, *args, **kwargs):
        kwargs['blank'] = True
        super().__init__(*args, **kwargs)

    def db_type(self, connection):
        return 'serial'
