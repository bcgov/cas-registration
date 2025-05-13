from django.dispatch import Signal

# Signal to notify when the registration purpose of an operation has changed
operation_registration_purpose_changed = Signal()
