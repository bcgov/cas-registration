class UserError(Exception):
    """
    Base class for user-related errors.
    These errors are typically used when we want to provide feedback to the user
    """

    pass


class InternalSystemError(Exception):
    """
    Base class for obps system-related errors.
    These errors are typically used for unexpected conditions that indicate a problem in either
    unforeseen manipulation of the system, or a bug in the code.
    """

    pass
