from django.shortcuts import render,redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from next_crm.models import Profile, Company, DefaultDataFields, CompanyModulesMapping, ContactFields, ContactTab, ContactTags, Modules, Countries, EmailTemplate
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
import hashlib
from django.conf import settings
from next_crm.helper.utils import Utils
from next_crm.views.Salesteams import add_default_sales_channel_on_signup
from next_crm.views.Products import add_default_product_tax
from next_crm.helper.file_helper import upload_file
from next_crm.helper.common import check_wizard_complete
from next_crm.helper.contact import test_validate_email
from next_crm.views.Salesteams import get_company_default_channel


def register(request):
    util = Utils()
    roles = settings.DEFAULT_ROLES
    return_status = {'msg': '', 'name':'','email':'','password':'', 'compnay_name':'', 'phone':''}
    if request.method == "POST":
            first_name = request.POST.get("first_name")
            last_name = request.POST.get("last_name")
            name = request.POST.get("email")
            email = request.POST.get("email")
            password = request.POST.get("password")
            compnay_name = request.POST.get("compnay_name")
            phone = request.POST.get("phone")

            return_status['first_name'] = first_name
            return_status['last_name'] = last_name
            return_status['name'] = name
            return_status['email'] = email
            return_status['password'] = password
            return_status['compnay_name'] = compnay_name
            return_status['phone'] = phone

            if not User.objects.filter(username=name).exists():
                if not User.objects.filter(email=email).exists():
                    activation_key = hashlib.sha256(email.encode('utf-8')).hexdigest()[:30]
                    user = User.objects.create_user(first_name=first_name, last_name=last_name, username=name, email=email, password=password, last_login=timezone.now())
                    user.last_login = timezone.now()
                    if user:
                        company = Company(company=compnay_name, email=email, user=user, phone=phone)
                        company.save()
                        profile = Profile(company=company, is_super_admin=True, is_admin=True, color=settings.ADMIN_COLOR, phone=phone, activation_key=activation_key, user=user, roles=roles)
                        profile.save()
                        insert_default_tags(company, user.id)
                        status  = save_default_fields(company, user.id, 'English')
                        initalize_modules(company)
                        util.send_activation(user, profile)
                        if(status):
                            user = authenticate(username=name, password=password)
                            login(request, user)
                            sales_channel = add_default_sales_channel_on_signup(request)
                            default_tax = add_default_product_tax(request)
                            if sales_channel:
                                try:
                                    profile = Profile.objects.get(user=user)
                                    profile.default_sales_channel = sales_channel
                                    profile.save()
                                except Profile.DoesNotExist:
                                    print("Profile.DoesNotExist")

                            return HttpResponseRedirect('/company-wizard/')
                        else:
                            return HttpResponseRedirect('/register/')
                    else:
                        return_status['msg'] = 'User could not saved!! '
                        return render(request, 'web/auth/register.html', {'return_status': return_status})
                else:
                    return_status['msg'] = 'Email already exits.'
                    return render(request, 'web/auth/register.html', {'return_status': return_status})
            else:
                return_status['msg'] = 'Username  already exits.'
                return render(request, 'web/auth/register.html', {'return_status':return_status})
    else:
        return render(request, 'web/auth/register.html', {'return_status':return_status} )


def user_detail(request):
    user = User.objects.get(pk=2)
    print(request.user.company.id,request.user.profile.roles)
    return HttpResponse(user.email)


def login_view(request):
    return_status = {'msg':''}
    if not request.user.is_authenticated:
        if request.method == "POST":
            name = request.POST.get("name")
            password = request.POST.get("password")
            user = authenticate(username=name, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    if request.user.profile.is_super_admin and not check_wizard_complete(request):
                        return HttpResponseRedirect('/company-wizard/')
                    else:
                        return HttpResponseRedirect('/dashboard/')
                else:
                    return_status['msg'] = 'Please activate your account by your email activation link'
                    return render(request, 'web/auth/login.html', {'return_status': return_status})
            else:
                return_status['msg'] = 'Invalid credentials.'
                return render(request, 'web/auth/login.html', {'return_status':return_status})
        else:
            return render(request, 'web/auth/login.html', {'return_status':return_status})
    else:
        return HttpResponseRedirect('/dashboard/')

def company_wizard_step_one(request):
    if request.user.profile.is_super_admin and not check_wizard_complete(request):
        return_status = {'msg': ''}
        countries = Countries.objects.all()
        if request.method == "POST":
            file_full_path = None
            country = request.POST.get("country")
            language = request.POST.get("language")
            curency = request.POST.get("curency")
            timezone = request.POST.get("timezone")
            file = request.FILES['account-dp'] if 'account-dp' in request.FILES else False
            if file:
                file_path = 'media/files/' + str(request.user.company.id) + '/profile_images'
                file_return_data = upload_file(file_path, file)
                file_full_path = file_return_data['url']
            try:
                country_obj = Countries.objects.get(pk=country)
                if country_obj.code == 'FR':
                    language = 'fr'
                    curency = 'euro'
                else:
                    language = 'en'
                    curency = 'dollar'
                company = Company.objects.get(id=request.user.company.id)
                company.country = country_obj
                company.language = language
                company.currency = curency
                company.timezone = timezone
                if file_full_path:
                    company.profile_image = file_full_path
                company.is_wizard_complete = True
                company.save()
                try:
                    profile = Profile.objects.get(company_id=request.user.profile.company_id, is_super_admin=True)
                    profile.language = language
                    profile.save()

                    return HttpResponseRedirect('/user-invite/')
                except Profile.DoesNotExist:
                    print("Profile does not exits")
            except Company.DoesNotExist:
                print("company does not exits")
        return render(request, 'web/auth/company_wizard_step_one.html', {'return_status': return_status, 'countries':countries})
    else:
        return HttpResponseRedirect('/dashboard/')

def company_wizard_step_two(request):
    company_users = Profile.objects.filter(is_super_admin=False, company_id=request.user.profile.company_id).count()
    default_template = save_email_template(request)
    if request.user.profile.is_super_admin and company_users == 0:
        return_status = {'msg': None, 'emails':[{'name':'email_1', 'class':'', 'value':'', 'style':''},
                                                {'name':'email_2', 'class':'', 'value':'', 'style':''},
                                                {'name':'email_3', 'class':'',  'value':'', 'style':''},
                                                {'name':'email_4', 'class':'',  'value':'', 'style':''},
                                                {'name':'email_5', 'class':'',  'value':'', 'style':''}
                                                ]
                         }
        language = request.user.profile.company.language
        company_id = request.user.profile.company_id
        email_exits = False
        if request.method == "POST":
            for index, post_email in enumerate(return_status['emails']):
                request_email = request.POST.get(return_status['emails'][index]['name'])
                print("request_email", request_email)
                if  User.objects.filter(username=request_email).exists() or  User.objects.filter(email=request_email).exists():
                    return_status['emails'][index]['style'] = 'border-color: red;'
                    email_exits = True
                return_status['emails'][index]['value'] = request_email
            if not email_exits:
                for index, post_email in enumerate(return_status['emails']):
                    util = Utils()
                    if return_status['emails'][index]['value']:
                        activation_key = hashlib.sha256(return_status['emails'][index]['value'].encode('utf-8')).hexdigest()[:30]
                        new_user = User.objects.create_user(username=return_status['emails'][index]['value'], email=return_status['emails'][index]['value'], is_active=False )
                        new_user.save()
                        default_roles = ['ROLE_MANAGE_ALL_CONTACT','ROLE_MANAGE_ALL_CALENDAR','ROLE_MANAGE_ALL_OPPORTUNITY','ROLE_MANAGE_ALL_QUOTATION',
                                         'ROLE_MANAGE_ALL_INVOICE','ROLE_MANAGE_ALL_SALES','ROLE_ACCESS_RIGHT','ROLE_ACCESS_SETTING']
                        new_user.profile = Profile(activation_key=activation_key, color=util.get_profile_color(new_user.id), company_id=company_id, user_id=new_user.id, language=language, roles=default_roles)
                        new_user.profile.default_sales_channel = get_company_default_channel( company_id)
                        new_user.profile.save()
                        util.send_activation(new_user, new_user.profile , True)
                return redirect('/welcome/')
        return render(request, 'web/auth/company_wizard_step_two.html', {'return_status': return_status})
    else:
        return redirect('/dashboard/')



def company_wizard_welcome(request):
    if request.user.profile.is_super_admin:
        return render(request, 'web/auth/company_wizard_welcome.html')
    else:
        return redirect('/dashboard/')


def invite_user_activate(request, activation_key):
    return_status = {'msg': '','activation_key':activation_key}
    if request.method == "POST":
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        activation_key = request.POST.get('activation_key')
        password = request.POST.get('password')
        try:
            profile = Profile.objects.get(activation_key=activation_key)
            if profile:
                user = User.objects.get(pk=profile.user.id)
                user.set_password(password)
                user.first_name = first_name
                user.last_name = last_name
                profile.activation_key = None
                profile.save()
                user.is_active =True
                user.save()
                return_status['msg']= True,
                return redirect('/login/')
        except Profile.DoesNotExist:
            return_status['msg'] = 'User Does not exit.'
    return render(request, 'web/auth/invite_user.html', {'return_status': return_status})

def forgot_password(request):
    return_status = {'msg': ''}
    util = Utils()
    if request.method == "POST":
        #todo write code here
        email = request.POST.get("email")
        try:
            user = User.objects.get(email=email)
            if user:
                activation_key = hashlib.sha256(email.encode('utf-8')).hexdigest()[:30]
                user.profile.activation_key = activation_key
                user.profile.save()
                util.reset_password(user, user.profile)
                return_status['msg'] = 'Your password rest link has been send on your email. '
            else:
                return_status['msg'] = email + '  this email does not exits.'
        except User.DoesNotExist:
            return_status['msg'] = email + '  this email does not exits.'
        return render(request, 'web/auth/forgot_password.html', {'return_status': return_status})
    else:
        return render(request, 'web/auth/forgot_password.html', {'return_status': return_status})


def activate_user(request, activation_key):
    return_status = {'msg': ''}
    if activation_key:
        try:
            profile = Profile.objects.get(activation_key=activation_key)
            if profile:
                user = User.objects.get(pk=profile.user.id)
                profile.activation_key = None
                profile.save()
                user.is_active = True
                user.password
                user.save()
                return redirect('/login/')
        except Profile.DoesNotExist:
            return redirect('/login/')
    else:
        return render(request, 'web/auth/activate_user.html', {'return_status': return_status})


def reset_password(request, activation_key):
    return_status = {'msg': ''}
    if request.method == "POST":
            re_password = request.POST.get("re_password")
            password = request.POST.get("password")
            if re_password == password:
                try:
                    user = User.objects.get(profile__activation_key=activation_key)
                    user.set_password(password)
                    user.save()
                    user.profile.activation_key = None
                    user.profile.save()
                    return redirect('/login/')
                except User.DoesNotExist:
                    return_status['msg'] = 'User Does not exits '
            else:
                return_status['msg'] = 'Password and Retype password, not matching '
    return render(request, 'web/auth/reset-password.html', {'return_status': return_status,'activation_key':activation_key})


def logout_view(request):
    logout(request)
    return HttpResponseRedirect('/login/')


#will not delete this funciton
def save_default_fields(company_id, user_id, language):
    lst = []
    default_data_fields = DefaultDataFields.objects.all().filter(language=language)
    for o in default_data_fields:
        contact_field = ContactFields()
        contact_field.name = o.name
        contact_field.type = o.type
        contact_field.label = o.label
        contact_field.is_default = o.is_default
        contact_field.is_required = o.is_required
        contact_field.display_weight = o.display_weight
        contact_field.display_position = o.display_position
        contact_field.is_unused = o.is_unused
        contact_field.default_values = o.default_values
        contact_field.user_id = user_id
        contact_field.company =company_id
        contact_field.save()
        lst.append(contact_field.id)
    contact_tab = ContactTab()
    contact_tab.module_id = 1
    if language == 'english':
        contact_tab.name = 'Contact & Address'
    else:
        contact_tab.name = 'Adresse de contact'
    contact_tab.fields = lst
    contact_tab.display_weight =1
    contact_tab.is_default = True
    contact_tab.user_id = user_id
    contact_tab.company = company_id
    contact_tab.save()
    return True

def save_email_template(request):
    util = Utils()
    company_id = request.user.profile.company_id
    template_list = ['quotation', 'sales-order', 'invoice', 'contact', 'opportunity']
    for template in template_list:
        try:
            email_tmpl_obj = EmailTemplate.objects.get(company_id=company_id, is_deleted=False, module_type=template, is_default=True)
        except EmailTemplate.DoesNotExist:
            return_data = util.set_default_template(request.user.profile.language.lower(), template)
            email_tmpl_obj = EmailTemplate()
            email_tmpl_obj.name = return_data['template_name']
            email_tmpl_obj.module_type = template
            email_tmpl_obj.subject = return_data['subject']
            email_tmpl_obj.description = return_data['description']
            email_tmpl_obj.company_id = company_id
            email_tmpl_obj.user_id = request.user.id
            email_tmpl_obj.create_by_user_id = request.user.id
            email_tmpl_obj.update_by_user_id = request.user.id
            email_tmpl_obj.is_default = True
            email_tmpl_obj.save()

#will not delete this funciton
def insert_default_tags(company_id, user_id):
    ContactTags.objects.create( name='Partner', color= 'color-1', user_id=user_id, company=company_id)
    ContactTags.objects.create(name='Vendor', color='color-2', user_id=user_id, company=company_id)
    ContactTags.objects.create(name='Prospect', color='color-3', user_id=user_id, company=company_id)
    ContactTags.objects.create(name='Employee', color='color-4', user_id=user_id, company=company_id)
    ContactTags.objects.create(name='Consultancy Services', color='color-5', user_id=user_id,company=company_id)
    ContactTags.objects.create(name='Components Buyer', color='color-6', user_id=user_id, company=company_id)
    ContactTags.objects.create(name='Services', color='color-7', user_id=user_id, company=company_id)

def initalize_modules(company_id):
    modules = Modules.objects.all()
    for module in modules:
        CompanyModulesMapping.objects.create(module_id= module.id, company=company_id)
