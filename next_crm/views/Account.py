from django.shortcuts import render,redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json,ast
from django.conf import settings
from django.contrib.auth.models import User
from next_crm.models.comapany_modules_mapping import CompanyModulesMapping, Modules
from next_crm.models.stripe import Stripe
from next_crm.models.company import Company
from next_crm.models.countries import Countries
from next_crm.helper.stripe_helper import create_customer, create_subscription,  get_all_invoice, check_vat_valid
from next_crm.helper.utils import Utils
import time


@login_required(login_url="/login/")
def payment(request):
    return HttpResponseRedirect('/payment_step_1/')

@login_required(login_url="/login/")
def payment_step_1(request):
    if request.user.company.company_status == 'client':
        return redirect('/dashboard/')
    else:
        countries = Countries.objects.all()
        return render(request, 'web/payment_step_1.html',{'countries':countries})

@login_required(login_url="/login/")
def payment_step_2(request):
    company_id = request.user.profile.company_id
    stripe_key = settings.STRIPE_SETTINGS['stripe_key_test_public']
    vat_percent_value = settings.VAT['value']
    vat_percent_percent = settings.VAT['percent']
    util = Utils()
    joining_date_status = util.get_login_period(request.user.date_joined)
    vat_message=None

    if request.method == "POST":
        vat_number = request.POST['vat']
        is_vat_will_charge = request.POST['is_vat_will_charge']
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        try:
            user = User.objects.get(pk=request.user.id)
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        except User.DoesNotExist:
            print('User DoesNotExist')

        try:
            company =Company.objects.get(pk=request.user.profile.company_id)
            company.billing_street = request.POST['company-name']
            company.billing_city = request.POST['city']
            company.billing_zip = request.POST['zip']
            company.billing_street = request.POST['street']
            try:
                country = Countries.objects.get(pk=request.POST['country'])
                company.country = country
            except Countries.DoesNotExist:
                print('Countries DoesNotExist')
            company.save()
        except Company.DoesNotExist:
            print('Company DoesNotExist')


        if is_vat_will_charge and vat_number!='':
            return_status = check_vat_valid(vat_number)
            if return_status:
                vat_charge = False
            else:
                vat_charge = True
        elif is_vat_will_charge and vat_number == '':
            vat_charge = True
        else:
            vat_charge = False
        try:
            if request.user.stripe.customer_id:
                return HttpResponseRedirect("/dashboard/")
        except:
            pass
            module_list = []
            total_user = 1
            modules = Modules.objects.all()
            active_user = User.objects.select_related('profile').filter(is_active=True).filter(
                profile__company_id=company_id).count()
            if active_user > 1:
                total_user = active_user

            if modules:
                for module in modules:
                    if module.slug == 'crm':
                        data_app = 'crm'
                        data_requires = 'contact, calendar'
                        icon = 'fa fa-th'
                    if module.slug == 'invoice':
                        data_app = 'invoice'
                        data_requires = ''
                        icon = 'icon-invoice'
                    if module.slug == 'quotations':
                        data_app = 'quotations'
                        data_requires = ''
                        icon = 'icon-quotations'
                    if module.slug == 'opportunity':
                        data_app = 'opportunity'
                        data_requires = ''
                        icon = 'icon-opportunity'
                    module_list.append({'name': module.name, 'slug': module.slug, 'price': '', 'data_app': data_app,
                                        'data_requires': data_requires, 'icon': icon})
            price = settings.PRICES
            if joining_date_status['expire_days'] in [7, 6, 5, 4, 3]:
                price['discount'] = 40
            elif joining_date_status['expire_days'] in [2, 1]:
                price['discount'] = 50
            else:
                price['discount'] = 25


            #print("vat_message", vat_message)
            return render(request, 'web/payment_step_2.html',
                          {'prices': price, 'modules': module_list, 'total_user': total_user, 'stripe_key': stripe_key,
                           'vat_charge':vat_charge,'vat_percent_value':vat_percent_value,'vat_message':vat_message,'vat_percent_percent':vat_percent_percent})
    else:
        return redirect('/payment_step_1/')



@login_required(login_url="/login/")
def payment_step_3(request):
    if request.method == "POST":
        total_user = request.POST['user']
        plan_type  = request.POST['_period']
        apps = request.POST.getlist('apps')
        discount = request.POST['discount']
        total_cost = request.POST['total_cost']
        is_vat_will_charge =request.POST['is_vat_will_charge']
        vat_charge = request.POST['vat_charge']
        stripe_key = settings.STRIPE_SETTINGS['stripe_key_test_public']
        user_price_key = 'user_' + discount + '_percent_' + plan_type + '_price'
        total_user_cost = int(total_user) * settings.PRICES[user_price_key]
        total_app_price = 0
        total_apps = len(apps)
        if total_apps > 0:
            for app in apps:
                app_price_key = app + '_' + discount + '_percent_'+ plan_type + '_price'
                total_app_price = total_app_price + settings.PRICES[app_price_key]
        sum = total_app_price + total_user_cost

        if plan_type == 'yearly':
            sum = sum * 12
        display_price = {
            'total_user_cost':total_user_cost,
            'total_app_price':total_app_price,
            'total_apps':total_apps,
            'total_price':sum,
            'total_user':total_user,
            'apps': ",".join(apps ),
            'plan_type':plan_type,
            'discount':discount,
            'total_cost':total_cost,
            'vat_charge':vat_charge,
            'is_vat_will_charge':ast.literal_eval(is_vat_will_charge)
         }
        return render(request, 'web/payment_step_3.html', {'prices' :display_price ,'stripe_key':stripe_key})
    else:
        return redirect('/payment_step_2/')



@login_required(login_url="/login/")
@csrf_exempt
def paymentProcess(request):
    user_id = request.user.id
    company_id= request.user.profile.company_id
    email = request.user.company.email
    return_response = {'success': False,'message':''}
    if request.method == "POST":
        apps = request.POST['apps'].split(",")
        selected_users = request.POST['total_user']
        token = request.POST['stripeToken']
        plan = request.POST['plan_type']
        discount = request.POST['discount']
        total_cost = request.POST['total_cost']
        is_vat_will_charge =request.POST['is_vat_will_charge']
        if len(apps) > 0:
            customer = create_customer(email, token)
            if customer:
                customer_id = customer.id
                subscription = create_subscription(customer_id, apps, selected_users, plan, discount, is_vat_will_charge)
                if subscription:
                    for app_slug in apps:
                        CompanyModulesMapping.save_update_company_modules_mapping(app_slug, company_id)
                    try:
                        print("test::::", company_id)
                        stripe_payments = Stripe.objects.get(company_id=company_id)
                        stripe_payments.token = token
                        stripe_payments.customer_id = customer_id
                        stripe_payments.plan = plan
                        stripe_payments.amount = total_cost
                        stripe_payments.selected_users = selected_users
                        stripe_payments.subscription_id = subscription.id
                        stripe_payments.save()
                    except Stripe.DoesNotExist:
                        stripe_payments = Stripe.objects.create(user_id=user_id, company_id=company_id,
                                                                token=token,
                                                                customer_id=customer_id, plan=plan,
                                                                amount=total_cost, subscription_id=subscription.id,
                                                                selected_users=selected_users,discount=discount)
                    try:
                        company = Company.objects.get(id=company_id)
                        if company:
                                company.company_status='client'
                                company.save()
                    except Company.DoesNotExist:
                        return_response['message'] = 'Profile DoesNotExist'
                    return_response['success'] =True
                    return redirect('/dashboard/')
        else:
            print("blank")
    return HttpResponse(json.dumps(return_response), content_type="application/json")


def thank_you(request):
    return render(request, 'web/thank_you.html')


@login_required(login_url="/login/")
def price_list(request):
    return render(request, 'web/app.html')


