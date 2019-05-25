from django.shortcuts import redirect
from datetime import datetime, timedelta
from functools import wraps
from next_crm.models.comapany_modules_mapping import CompanyModulesMapping
from next_crm.models.profile import Profile

def access_setting(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated:
            if 'ROLE_ACCESS_SETTING' in request.user.profile.roles:
                return function(request, *args, **kwargs)
            else:
                return redirect('/dashboard/')

        else:
            return redirect('/login/')

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def access_right(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated:
            if 'ROLE_ACCESS_RIGHT' in request.user.profile.roles:
                return function(request, *args, **kwargs)
            else:
                return redirect('/dashboard/')

        else:
            return redirect('/login/')

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def manage_contact(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated:
            if 'ROLE_MANAGE_ALL_CONTACT' in request.user.profile.roles:
                return function(request, *args, **kwargs)
            else:
                return redirect('/dashboard/')

        else:
            return redirect('/login/')

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def manage_view_calender(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated:
            if 'ROLE_MANAGE_ALL_CALENDAR' in request.user.profile.roles:
                return function(request, *args, **kwargs)
            else:
                return redirect('/dashboard/')
        else:
            return redirect('/login/')

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def view_own_calender(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated:
            if 'ROLE_VIEW_OWN_MANAGE_OWN_CALENDAR' in request.user.profile.roles:
                return function(request, *args, **kwargs)
            else:
                return redirect('/dashboard/')

        else:
            return redirect('/login/')

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def trial_over(function):
    def wrap(request, *args, **kwargs):
        date_join = request.user.date_joined
        expire_in_date = date_join + timedelta(days=14)
        trial_over_days = int(abs((datetime.now().date() - expire_in_date.date()).days))
        if trial_over_days <= 7 and (request.user.is_superuser or request.user.profile.is_admin) and request.user.profile.company.company_status == 'T':
           return redirect('/dashboard/')
        else:
          return function(request, *args, **kwargs)

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def company_module_status(module_name):
    def decorator(view):
        @wraps(view)
        def wrapper(request, *args, **kwargs):
            if request.user.profile.company.company_status == 'client':
                module = CompanyModulesMapping.objects.select_related("module").get(company_id=request.user.profile.company_id, module__name=module_name)
                if module.is_installed:
                    return view(request, *args, **kwargs)
                else:
                    return redirect('/dashboard/')
            else:
                return view(request, *args, **kwargs)
        return wrapper
    return decorator

def user_invited(function):
    def wrap(request, *args, **kwargs):
        company_users = Profile.objects.filter(is_super_admin=False, company_id=request.user.profile.company_id).count()
        if company_users == 0 and request.user.profile.is_super_admin:
           return redirect('/user-invite/')
        else:
          return function(request, *args, **kwargs)

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap