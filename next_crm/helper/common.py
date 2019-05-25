

def check_wizard_complete(request):
    if request.user.profile.company.language and request.user.profile.company.currency and request.user.profile.company.country:
        return True
    else:
        return False
