from django.shortcuts import get_object_or_404

from registration.models import Operator, UserOperator
from django.db import transaction

# import statements are telling--a good time to ask yourself why do I need this here
# every service has its own responsiblity
# need a service to access the data--this is where we have methods to access the db, get user etc.
# keep unit tests small
# every time we make a call it's unambigious what's being done
# requesting access is more than just asking the db for something
# api layer just calls different sservices to get stuff done--it's single responisbility is to respond to calls
# can consider decorators as their own service
# can use data transfer objects if things get bloated (pass a dictionary instead of single parameters
# if you want a user, you get back either the user or something else
# don't even need a db to test the non-db services
# have to raise an error to trigger rollback in transaction.atomic
# atomic transaction wrapper

# probably we'll have more separation
class DataAccessService:
    # brianna other functions will go here (or be divided further)
    def get_operator(operator_id):
        return get_object_or_404(Operator, id=operator_id)
    
    @transaction.atomic()
    def get_or_create_user_operator(user, operator):
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=operator, status=UserOperator.Statuses.PENDING, role=UserOperator.Roles.PENDING
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return user_operator