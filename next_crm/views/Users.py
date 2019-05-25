from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
import json,ast
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from next_crm.models.profile import Profile
from next_crm.models.roles import Roles
import time, hashlib, random
from next_crm.helper.utils import Utils
from next_crm.models.stripe import Stripe
from next_crm.models.company import Company
from next_crm.models.countries import Countries
from next_crm.helper.stripe_helper import update_subscription_by_user
from next_crm.helper.file_helper import upload_file
from django.conf import settings
from next_crm.views.Salesteams import get_company_default_channel


@login_required(login_url="/login/")
def user_list(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def user_create(request):
    roles = Roles.objects.all()
    temp_roles ={}
    roles_list =[]

    if roles:
        for role in roles:
            try:
                temp_roles[role.module].append(role.code)
            except KeyError:
                temp_roles[role.module] = [role.code]
            #print(temp_roles)
        roles_list.append(temp_roles)
        print(roles_list)
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def user_view(request,user_id):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def company_settings(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def profile(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
@csrf_exempt
def user_save(request):
    user_id = request.user.id
    return_status = {'success': False, 'user': 0, 'msg':'', 'activation_link':'','redirect_url':''}
    if request.method == "POST" and request.is_ajax():
        post_user_id = int(request.POST['user_id'])
        name = request.POST['email']
        email = request.POST['email']
        password = request.POST['password']
        language = request.POST['language']
        signature = request.POST['signature']
        phone = request.POST['phone']
        mobile = request.POST['mobile']
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        profile_image = request.POST['profile_image']
        roles = ast.literal_eval(request.POST['roles'])
        user_email = User.objects.filter(email=email)
        user_name = User.objects.filter(username=name)
        activation_key = hashlib.sha256(email.encode('utf-8')).hexdigest()[:30]
        google_client_id = request.POST['google_client_id']
        google_client_secret = request.POST['google_client_secret']
        user_time_zone = request.POST['user_time_zone']

        admin = False
        staff = False
        password_changed = False
        if 'Staff' in roles:
            staff =True
        if 'Admin' in roles:
            admin =True

        if post_user_id and post_user_id > 0:
            try:
                user = User.objects.get(pk=post_user_id)
                user.username=name
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                if password:
                    user.set_password(password)
                    password_changed = True
                    return_status['redirect_url']= '/login/'
                user.save()
                try:
                    if len(roles) > 0:
                        user.profile.roles = roles
                    else:
                        user.profile.roles = user.profile.roles
                    user.profile.language = language
                    user.profile.phone = phone
                    user.profile.mobile = mobile

                    user.profile.is_admin = admin
                    user.profile.profile_image = profile_image
                    user.profile.temp_pass=password
                    user.profile.signature=signature
                    user.profile.google_client_id= google_client_id
                    user.profile.google_client_secret =google_client_secret
                    user.profile.user_time_zone =user_time_zone
                    user.profile.save()
                    return_status['user'] = user.id
                    return_status['success'] = True
                    if password_changed:
                        return_status['msg'] = 'You changed your password that is update successfully, so you will redirect to login page after 5 second.'
                    else:
                        return_status['msg'] = settings.LABELS[request.user.profile.language]['text_update_sueess']
                except Profile.DoesNotExist:
                    return_status['msg'] = 'Profile DoesNotExist'
                    return_status['success'] = False
            except User.DoesNotExist:
                return_status['msg'] = 'User DoesNotExist'
                return_status['success'] = False
        else:
            if user_email.exists():
                return_status['msg'] = 'user email already exits' #settings.LABELS[request.user.profile.language]['text_email_exits']
            elif user_name.exists():
                return_status['msg'] = 'username already exits'
            else:
                util = Utils()
                new_user = User.objects.create_user(username=name, email=email, is_active=False, first_name=first_name, last_name=last_name, password=password, last_login=timezone.now())
                new_user.save()

                profile = Profile(activation_key=activation_key, color=util.get_profile_color(new_user.id), is_admin=admin, temp_pass=password,profile_image=profile_image,phone=phone,mobile=mobile, company_id=request.user.profile.company_id, user_id=new_user.id, language=language, roles=roles)
                profile.default_sales_channel = get_company_default_channel( request.user.profile.company_id)
                profile.save()

                return_status['success'] = True
                return_status['user'] = new_user.id
                return_status['msg'] = 'User Created Successfully..'
        return HttpResponse(json.dumps(return_status), content_type='application/json')
    else:
        return HttpResponse(return_status)


@login_required(login_url="/login/")
#@access_setting
def get_all_user(request):
    util = Utils()
    company_id = request.user.profile.company_id
    return_status = {'success': False, 'users': [], 'msg': ''}
    users_list =[]
    users = Profile.objects.select_related('user','company').filter(company_id=company_id).order_by('user__id')

    if users:
        for u in users:
            color = u.color
            print(color)
            super_admin = False
            editable = True
            if u.phone:
                phone = u.phone
            else:
                phone ='-'

            if u.user.is_superuser:
                user_type = 'Super Admin'
                if request.user.is_superuser:
                    editable = True
                else:
                    editable = False
                user_is_staff = False
                super_admin = True
            elif u.is_admin:
                user_is_staff = False
                user_type = settings.LABELS[request.user.company.language]['text_admin']
            else:
                user_is_staff = True
                user_type = settings.LABELS[request.user.company.language]['text_staff']

            if u.user.is_active:
                user_status_text = settings.LABELS[request.user.company.language]['text_deactivate']
                user_status_class = 'glyphicon-ok text-success'
            else:
                user_status_text =settings.LABELS[request.user.company.language]['text_activate']
                user_status_class = 'glyphicon-remove text-danger'
            users_list.append({'username':u.user.username,'email':u.user.email,'phone':phone,
                               'language':u.language,'company':u.company.company,
                               'permissions':u.roles,
                               'id':u.user.id,
                               'is_staff':user_is_staff,
                               'user_type':user_type,
                               'super_admin':super_admin,
                               'status':user_status_text,
                               'user_status_class':user_status_class,
                               'editable':editable,
                               'color':color
                               })
        return_status['users'] = users_list
        return_status['success'] = True
    return HttpResponse(json.dumps(return_status), content_type='application/json')


def get_common_user(request_data, user_id):
    company_id =request_data.user.profile.company.id
    return_status = {'success': False, 'user':{}, 'msg': '' }
    users = Profile.objects.select_related('user', 'company').filter(user__id=user_id).filter(company_id=company_id)
    return_status['time_zones']= settings.TIME_ZONE_NAME
    if users:
        for u in users:
            print(u.user.is_staff, u.user.is_superuser, u.is_admin)

            if u.user.is_superuser or u.is_admin:
                return_status['user']['application_role_value'] = 'Admin'
                return_status['user']['application_role_label'] = 'Admin : can installation application and add new user'
            elif u.user.is_staff or not u.is_admin:
                return_status['user']['application_role_value'] = 'Staff'
                return_status['user']['application_role_label'] = 'Staff : user cannot install applications neither adding new user'

            return_status['user']['username'] = u.user.username
            return_status['user']['email'] = u.user.email
            return_status['user']['user_id'] = u.user.id
            return_status['user']['username'] = u.user.username
            return_status['user']['phone'] = u.phone
            return_status['user']['mobile'] = u.mobile
            return_status['user']['first_name'] = u.user.first_name
            return_status['user']['last_name'] = u.user.last_name
            return_status['user']['google_client_id'] = u.google_client_id
            return_status['user']['google_client_secret'] = u.google_client_secret
            return_status['user']['user_time_zone'] = u.user_time_zone

            if u.profile_image:
                return_status['user']['profile_image'] = u.profile_image
            else:
                return_status['user']['profile_image'] = settings.DEFAULT_PROFILE_IMAGE
            return_status['user']['signature'] = u.signature
            return_status['user']['language'] = u.language
            return_status['user']['language_label'] = settings.LANGUAGES[u.language]

            contact_role = set(settings.CONTACT_ROLES).__and__(set(u.roles))

            for con in contact_role:
                return_status['user']['contact_role_value'] = con
                return_status['user']['contact_role_label'] = settings.CONTACT_ROLES[con]

            cal_role = set(settings.CALENDAR_ROLES).__and__(set(u.roles))

            for cal in cal_role:
                return_status['user']['calendar_role_value'] = cal
                return_status['user']['calendar_role_label'] = settings.CALENDAR_ROLES[cal]

            opportunity_role = set(settings.OPPORTUNITY_ROLES).__and__(set(u.roles))
            for opp in opportunity_role:
                return_status['user']['opportunity_role_value'] = opp
                return_status['user']['opportunity_role_label'] = settings.OPPORTUNITY_ROLES[opp]

            quotation_role = set(settings.QUOTATION_ROLES).__and__(set(u.roles))
            for quotation in quotation_role:
                return_status['user']['quotation_role_value'] = quotation
                return_status['user']['quotation_role_label'] = settings.QUOTATION_ROLES[quotation]

            invoice_role = set(settings.INVOICE_ROLES).__and__(set(u.roles))
            for invoice in invoice_role:
                return_status['user']['invoice_role_value'] = invoice
                return_status['user']['invoice_role_label'] = settings.INVOICE_ROLES[invoice]

            sales_role = set(settings.SALES_ROLES).__and__(set(u.roles))
            for sale in sales_role:
                return_status['user']['sales_role_value'] = sale
                return_status['user']['sales_role_label'] = settings.SALES_ROLES[sale]
        return_status['success'] = True
    return return_status

@login_required(login_url="/login/")
def get_user(request, user_id):
    return_status = get_common_user(request, user_id)
    return HttpResponse(json.dumps(return_status), content_type='application/json')

@login_required(login_url="/login/")
def get_profile(request):
    user_id = request.user.id
    return_status = get_common_user(request, user_id)
    return HttpResponse(json.dumps(return_status), content_type='application/json')

def user_activate(request, activation_key):
    return_status = {'success': False, 'user': {}, 'msg': ''}
    try:
        profile = Profile.objects.get(activation_key=activation_key)
        if profile:
            user = User.objects.get(pk=profile.user.id)
            profile.activation_key = None
            profile.save()
            user.is_active =True
            user.save()
            return_status['success']= True,
            return redirect('/login/')
    except Profile.DoesNotExist:
        return redirect('/dashboard/')



@login_required(login_url="/login/")
@csrf_exempt
def user_delete(request):
    return_status = {'success': False, 'user': 0, 'msg': ''}
    if request.method == "POST" and request.is_ajax():
        users = request.POST['users']
        dic_data = json.loads(users)
        if len(dic_data) > 0:
            for d in dic_data:
                user = User.objects.get(pk=d)
                try:
                    if not user.is_superuser:
                        user.delete()
                        return_status['success'] = True
                except User.DoesNotExist:
                    return_status['msg'] = 'User DoesNotExist'
        if return_status['success']:
            return_status['msg'] = 'User Deleted !!'
        return HttpResponse(json.dumps(return_status), content_type='application/json')
    else:
        return HttpResponse(return_status)

@login_required(login_url="/login/")
@csrf_exempt
def user_change_status(request):

    proration_date = int(time.time())
    return_status = {'success': False,  'msg': '','user_status':''}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        user_id = request.POST['user_id']
        try:
            user = User.objects.get(pk=user_id)
            user.is_active = False if user.is_active else True
            user.save()
            if user.is_active:
                profile = Profile.objects.get(user_id=user_id)
                profile.activation_key = None
                profile.save()
                return_status['user_status'] = settings.LABELS[request.user.profile.language]['text_activate']
                return_status['msg'] = settings.LABELS[request.user.profile.language]['msg_user_activate']
                return_status['user_status_class'] = 'glyphicon-ok text-success'
                util = Utils()
                util.send_invitation(request.user.username, user, profile)

            else:
                return_status['user_status'] = settings.LABELS[request.user.profile.language]['text_deactivate']
                return_status['msg'] = settings.LABELS[request.user.profile.language]['msg_user_deactivate']

                return_status['user_status_class'] = 'glyphicon-remove text-danger'

            return_status['success'] = True
        except User.DoesNotExist:
            return_status['msg'] = 'User DoesNotExist'

        total_user = User.objects.select_related('profile').filter(is_active=True).filter(profile__company_id=company_id).count()
        try:
            if request.user.stripe.selected_users and request.user.stripe.selected_users < total_user:
                token= request.user.stripe.token
                customer_id= request.user.stripe.customer_id
                plan = request.user.stripe.plan
                if plan == 'yearly':
                    stripe_plan = 'yearly-user'
                else:
                    stripe_plan = 'monthly-user'
                subscription = update_subscription_by_user(customer_id, request.user.stripe.subscription_id, settings.STRIPE_PLANS[stripe_plan], total_user, proration_date)
                if subscription:
                    amount = 0
                    if subscription['items']['data']:
                        for item in subscription['items']['data']:
                            amount = amount + item['plan']['amount'] * item['quantity']
                    Stripe.save_update_stripe(user_id, company_id, token, customer_id, plan, amount, total_user, subscription.id)
        except:
            print("no strip account")
            #customer = create_customer(email, token)
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@login_required(login_url="/login/")
def get_company_info(request):
    #print(request.user.profile.company.company_status, request.user.profile.company.email)
    return_status = {'success': True, 'company': {}, 'msg': ''}
    print("my test",  request.user.company.country_id)
    return_status['company']['company_id'] = request.user.profile.company_id
    return_status['company'] ['name']= request.user.profile.company.company
    return_status['company']['email'] = request.user.company.email
    return_status['company']['phone'] = request.user.company.phone
    return_status['company']['mobile'] = request.user.company.mobile
    return_status['company']['language'] = request.user.company.language
    return_status['company']['currency'] = request.user.company.currency
    return_status['company']['street'] = request.user.company.street
    return_status['company']['city'] = request.user.company.city
    return_status['company']['zip'] = request.user.company.zip
    if request.user.company.country_id:
        return_status['company']['company_country_name'] = request.user.company.country.label
        return_status['company']['company_country_id'] = request.user.company.country_id

    if request.user.company.billing_country_id:
        return_status['company']['billing_country_name'] = request.user.company.billing_country.label
        return_status['company']['billing_country_id'] = request.user.company.billing_country_id
    return_status['company']['billing_company_name'] = request.user.company.billing_company_name
    return_status['company']['billing_street'] = request.user.company.billing_street
    return_status['company']['billing_city'] = request.user.company.billing_city
    return_status['company']['billing_zip'] = request.user.company.billing_zip
    return_status['company']['quotation_term_and_condition'] = request.user.company.quotation_term_and_condition
    return_status['company']['sales_term_and_condition'] = request.user.company.sales_term_and_condition
    return_status['company']['invoice_term_and_condition'] = request.user.company.invoice_term_and_condition
    return_status['company']['quotation_legacy_information'] = request.user.company.quotation_legacy_information

    if request.user.company.profile_image:
        return_status['company']['profile_image'] = request.user.company.profile_image
    else:
        return_status['company']['profile_image'] = settings.DEFAULT_COMPANY_LOGO
    return HttpResponse(json.dumps(return_status), content_type='application/json')

@login_required(login_url="/login/")
def company_save(request):
    return_status = {'success': False,  'msg': ''}
    if request.method == "POST" and request.is_ajax():
        print("hello test", request.POST['company_country_id'],request.user.company)
        company_id = request.user.company.id
        company_country_id = int(request.POST['company_country_id'])
        billing_country_id = int(request.POST['billing_country_id'])
        country = None
        billing_country =None
        try:
            company = Company.objects.get(pk=int(company_id))
            email = request.POST['email']
            company.company = request.POST['company_name']
            company.profile_image = request.POST['profile_image']
            company.phone = request.POST['phone']
            company.mobile = request.POST['mobile']
            company.language = request.POST['language']
            company.currency = request.POST['currency']
            company.street = request.POST['street']
            company.city = request.POST['city']
            company.zip = request.POST['zip']
            if company_country_id >0:
                try:
                    country = Countries.objects.get(id=company_country_id)
                except Company.DoesNotExist:
                    return_status['msg'] = 'company Countries DoesNotExist'
            company.country = country

            company.billing_company_name = request.POST['billing_company_name']
            company.billing_street = request.POST['billing_street']
            company.billing_city = request.POST['billing_city']
            company.billing_zip = request.POST['billing_zip']

            if billing_country_id > 0:
                try:
                    billing_country = Countries.objects.get(id=billing_country_id)
                except Company.DoesNotExist:
                    return_status['msg'] = 'billing_country  DoesNotExist'
            company.billing_country = billing_country

            company.quotation_term_and_condition= request.POST['quotation_term_and_condition']
            company.sales_term_and_condition = request.POST['sales_term_and_condition']
            company.invoice_term_and_condition = request.POST['invoice_term_and_condition']
            company.quotation_legacy_information = request.POST['legacy_information']
            company.save()
            return_status['success'] = True
            return_status['msg'] = 'Company updated successfully !!'
        except Company.DoesNotExist:
            return_status['msg'] = 'Company DoesNotExist'
    return HttpResponse(json.dumps(return_status), content_type='application/json')



@csrf_exempt
def profile_image_upload(request):
    user_company_id = request.user.profile.company_id
    return_status = {'success': False, 'url': '', 'width':'', 'height':'' }
    if request.method == 'POST':
        file_path = 'media/files/' + str(user_company_id) + '/profile_images'
        f = request.FILES['image']
        file_return  = upload_file(file_path, f)
        return_status['width'] = file_return['width']
        return_status['height'] = file_return['height']
        return_status['success'] = file_return['success']
        return_status['url'] =file_return['url']
        return_status['success'] = True
    return HttpResponse(json.dumps(return_status), content_type="application/json")

