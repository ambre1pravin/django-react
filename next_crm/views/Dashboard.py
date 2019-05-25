from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from next_crm.helper.decorator import trial_over, user_invited
from django.http import HttpResponse, HttpResponseRedirect
import json, time
from django.conf import settings
from next_crm.models.comapany_modules_mapping import CompanyModulesMapping
from next_crm.models.stripe import Stripe
from next_crm.helper.stripe_helper import update_subscription_by_application, delete_subscription_item
from next_crm.helper.utils import Utils
from next_crm.helper.common import check_wizard_complete




@login_required(login_url="/login/")
@user_invited
def index(request):
    if request.user.profile.is_super_admin and not check_wizard_complete(request):
        return HttpResponseRedirect('/company-wizard/')
    else:
        return render(request, 'web/app.html')

@login_required(login_url="/login/")
@trial_over
@user_invited
def apps(request):
    return render(request, 'web/app.html')

@login_required(login_url="/login/")
def modules(request):
    print("roles::" , request.user.profile.roles, type(request.user.profile.roles))
    return_response = {'result': [], 'status': True, 'message': '', 'link': '', 'trial_over': False, 'expire_message': ''}
    company_id = request.user.profile.company_id
    data_list =[]
    util = Utils()
    joining_date_status  = util.get_login_period(request.user.date_joined)
    user_modules = CompanyModulesMapping.objects.all().select_related("module").filter(company_id=company_id)

    if request.user.profile.company.company_status == 'trial':
        if request.user.profile.is_super_admin and joining_date_status['login_hours'] <=4  and request.user.profile.activation_key:
            return_response['message'] = 'Activation pending! Your account will expire in '+ str(joining_date_status['login_hours']) +' hours.'
        elif joining_date_status['left_days'] > 0 and joining_date_status['left_days'] <= 14 and (request.user.is_superuser or request.user.profile.is_admin):
            return_response['message'] = ' Your free trial will expire in '+str(joining_date_status['expire_days']) +' days'
            return_response['link'] = '/price-online/'
        elif joining_date_status['left_days'] == 0 and (request.user.is_superuser or request.user.profile.is_admin):
            return_response['message'] = ' Your free trial will expire Today.  '
            return_response['link'] = '/price-online/'
        else:
            if not request.user.profile.is_admin:
                return_response['trial_over'] = False
                return_response['message'] = ''
            else:
                return_response['message'] = 'Your free trial has been expired.'
                return_response['trial_over'] = False
                return_response['link'] = ''
    elif request.user.profile.company.company_status == 'client':
        user_modules = user_modules.filter(is_installed=True)

    '''if joining_date_status['left_days'] < 0:
        return_response['trial_over'] = True
        if joining_date_status['left_days'] <= 7 and (request.user.is_superuser or request.user.profile.is_admin) and request.user.profile.company.company_status == 'T':
            return_response['message'] = 'Your trial period is now OVER. We will keep your data on ' + str(joining_date_status['data_delete_date']) + '. To continue using our solution you have to '
    '''

    print("user_modules",user_modules)

    if len(user_modules) > 0:
        for user_module in user_modules:
            if user_module.module.slug == 'crm':
                data_list.append({'sort':1,'label': 'Contact', 'anchor_class':'contact tourist-place-1','css_class': 'icon-contact', 'link':  '/contact/list/' if not return_response['trial_over'] else ''})
                data_list.append({'sort':2,'label': 'Calendar', 'anchor_class':'calendar','css_class': 'icon-calendar', 'link': '/calendar/list/' if not return_response['trial_over'] else ''})
            if user_module.module.slug == 'opportunity' and 'ROLE_NO_ACCESS_OPPORTUNITY' not in request.user.profile.roles:
                data_list.append(
                    {'sort':3,'label': 'Opportunity', 'anchor_class': 'opportunity', 'css_class': 'icon-opportunity',
                     'link': '/opportunity/list/' if not return_response['trial_over'] else ''})

            if user_module.module.slug == 'sales':
                data_list.append({'sort':4, 'label': 'Quotations', 'anchor_class': 'quotations', 'css_class': 'icon-quotations','link': '/quotation/list/' if not return_response['trial_over'] else ''})
                data_list.append({'sort':5, 'label': 'Invoice', 'anchor_class': 'invoice', 'css_class': 'icon-quotations','link': '/customer/invoice/list/' if not return_response['trial_over'] else ''})

                data_list.append({'sort':6, 'label': 'Sales', 'anchor_class': 'sales', 'css_class': 'icon-sales',
                                  'link': '/sales/' if not return_response['trial_over'] else ''})

    if request.user.is_superuser or request.user.profile.is_admin:
        data_list.append({'sort':7, 'label': 'Settings', 'anchor_class':'settings','css_class': 'icon-settings', 'link': '/user/list/' if not return_response['trial_over'] else ''})

    try:
        stripe = Stripe.objects.get(company_id=request.user.profile.company_id)
        if stripe  and (request.user.is_superuser or request.user.profile.is_admin):
            data_list.append({'sort':8, 'label': 'Apps', 'anchor_class': 'apps', 'css_class': 'icon-apps', 'link': '/apps/' if not return_response['trial_over'] else ''})
    except:
        print("not stripe user")
    data_list = sorted(data_list, key=lambda k: k['sort'])
    return_response['result'] = data_list
    return HttpResponse(json.dumps(return_response), content_type="application/json")



@login_required(login_url="/login/")
def installed_applications(request):
    company_id = request.user.profile.company_id
    return_response = {'result': [], 'success': False, 'message': '', 'link': ''}
    data_list = []
    user_modules = CompanyModulesMapping.objects.all().select_related("module").filter(company_id=company_id)
    if len(user_modules) > 0:
        return_response['success'] = True
        for user_module in user_modules:
            if user_module.is_installed:
                application_installed = True
            else:
                application_installed = False
            price = settings.PRICES[user_module.module.slug +'_' +str(request.user.stripe.discount) +'_percent_'+str(request.user.stripe.plan)+'_price']

            if user_module.module.slug =='crm':
                data_list.append({'label': 'CRM', 'app':'crm', 'price':price, 'slug':user_module.module.slug, 'description':'Includes contact  + calendar', 'is_installed':application_installed, 'iclass': 'fa fa-th', 'link': '/contact/list/'})
            if user_module.module.slug == 'opportunity':
                data_list.append(
                    {'label': 'Opportunity', 'app':'opportunity', 'price':price, 'slug':user_module.module.slug, 'description':'This is Opportunity module','is_installed':application_installed,  'iclass': 'icon-opportunity',
                     'link': '/opportunity/list/'})
            if  user_module.module.slug == 'sales':
                data_list.append({'label': 'Sales', 'price':price, 'app': 'sales', 'slug': user_module.module.slug,
                                  'description': 'Includes Quotations + invoice module', 'is_installed': application_installed,
                                  'iclass': 'icon-sales', 'link': '/quotation/list/'})
    return_response['result'] =data_list
    return HttpResponse(json.dumps(return_response), content_type="application/json")

@login_required(login_url="/login/")
def install_applications(request):
    company_id = request.user.profile.company_id
    proration_date = int(time.time())
    app_slug = request.POST['app_name']
    return_response = {'result': [], 'success': False}
    stripe_plan = app_slug+'-'+str(request.user.stripe.discount)+'-percent-'+str(request.user.stripe.plan)
    print(stripe_plan)
    try:
        if request.user.stripe.plan and request.user.stripe.customer_id and request.user.stripe.subscription_id:
            customer_id = request.user.stripe.customer_id
            subscription = update_subscription_by_application(customer_id, request.user.stripe.subscription_id,
                                                              settings.STRIPE_PLANS[stripe_plan],  proration_date)
            if subscription:
                saved = CompanyModulesMapping.save_update_company_modules_mapping(app_slug, company_id)
                if saved:
                    return_response['success'] = True
        else:
            print("test")
    except:
        print("no strip account")
    return HttpResponse(json.dumps(return_response), content_type="application/json")

@login_required(login_url="/login/")
def uninstall_applications(request):
    company_id = request.user.profile.company_id
    app_slug = request.POST['app_name']
    return_response = {'result': [], 'success': False}
    if request.method == 'POST':
        try:
            if request.user.stripe.plan and request.user.stripe.subscription_id:
                customer_id = request.user.stripe.customer_id
                stripe_plan = app_slug + '-' + str(request.user.stripe.discount) + '-percent-' + str(
                    request.user.stripe.plan)
                delete_status = delete_subscription_item(customer_id, request.user.stripe.subscription_id, settings.STRIPE_PLANS[stripe_plan])
                if delete_status:
                    saved = CompanyModulesMapping.save_update_company_modules_mapping(app_slug, company_id, False)
                    if saved:
                        return_response['success'] = True
            else:
                print("test")
        except:
            print("no strip account")

    return HttpResponse(json.dumps(return_response), content_type="application/json")