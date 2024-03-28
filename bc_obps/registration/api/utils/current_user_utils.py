def get_current_user(request):
    return request.current_user


def get_current_user_guid(request):
    return request.current_user.user_guid
