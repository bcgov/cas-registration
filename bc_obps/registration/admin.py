from django.contrib import admin
from registration.models import NaicsCode, Document, User, Contact, Operator, UserOperator, Operation

admin.site.register(NaicsCode)
admin.site.register(Document)
admin.site.register(User)
admin.site.register(Contact)
admin.site.register(Operator)
admin.site.register(UserOperator)
admin.site.register(Operation)

