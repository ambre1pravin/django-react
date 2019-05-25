from django.shortcuts import render
from django.http import HttpResponse
from datetime import date, datetime, time
import datetime
from django.contrib.auth.decorators import login_required
from django.conf import settings
from next_crm.helper.utils import Utils
from django.core.files.storage import FileSystemStorage
import json, ast
import os, requests, errno
from django.db.models import Q
from next_crm.models import Sale_order, Company, Term, ContactTab, Product_cost_history, Payment_register_record, \
    Payment_register, Customer_invoice, Profile, EmailTemplate, Sale_order_record, Contact, ContactFields, \
    ContactFieldsValue, Product, Product_unit_of_measure, Product_template, Product_taxes, Quotation_template, Quotation_template_record, \
    Payment_term, Delivery_method
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from dateutil.relativedelta import relativedelta
import time, csv, decimal
from next_crm.helper.contact import contact_change_status, get_customer_by_id_list, get_valid_email
from django.db.models import Sum
from next_crm.helper.company import get_currency_name
from next_crm.helper.utils import Utils
from next_crm.views.General import message_create_for_create_action


@login_required(login_url="/login/")
def list(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def add(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def view(request, view_id):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def edit(request, edit_id):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def customerlist(request, list_id):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def listdata(request):
    utils = Utils()
    data = {}
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    total_amount = 0
    Customer_list = []
    currency = get_currency_name(company_id)
    limit = settings.PAGGING_LIMIT
    offset = ""
    if request.method == "POST":
        json_data = json.loads(request.POST['fields'])
        parameter = formatFields(json_data)
        dic_name = json.loads(request.POST['names'])
        dic_total = json.loads(request.POST['total_amount'])
        dic_customer = json.loads(request.POST['customer'])
        query = Q()
        total = Q()
        customer = Q()
        offset = int(parameter['offset'])
        limit = offset + int(limit)
        orderby = '-name'
        Customer = Customer_invoice.objects.filter(company=company_id)
        like_cond = Q()

        if len(dic_name) > 0:
            for name in dic_name:
                query = query | Q(name__icontains=name)
            Customer = Customer.filter(query)

        if len(dic_total) > 0:
            for totale in dic_total:
                total = total | Q(total_amount__icontains=totale)
            Customer = Customer.filter(total)

        if len(dic_customer) > 0:
            for customers in dic_customer:
                customer = customer | Q(customer_name__icontains=customers)
            Customer = Customer.filter(customer)

        total_unit = len(Customer)
        Customer = Customer.order_by(orderby)
        Customer = Customer[offset:limit]
        data['total_count'] = total_unit
        if len(Customer) > 0:
            for o in Customer:
                sent_email = o.email_sent_by_cron
                invoice_date = None
                due_date = None
                due_dated = 'after'
                email_due_date = ''
                if o.invoice_date is not None:
                    invoice_date = o.invoice_date.strftime('%d-%m-%Y')
                if o.due_date is not None:
                    if date.today() > o.due_date and o.status != 'paid':
                        due_dated = 'before'
                    else:
                        due_dated = 'after'
                    due_date = o.due_date.strftime('%d-%m-%Y')
                    mon_rel = relativedelta(days=5)
                    email_du_date = o.due_date - mon_rel
                    email_due_date = email_du_date.strftime('%d-%m-%Y')
                can_remove = False
                if o.status == 'draft' or o.status == 'cancel':
                    can_remove = True

                remove_cross_button = False
                color = '#777'
                envelop_info = ''
                cross_button_info = ''
                if o.status == 'open':
                    if o.email_sent_by_cron:
                        color = '#008000'
                        if o.email_sent_on:
                            envelop_info = 'This invoice have been sent on the ' + str(
                                (o.email_sent_on).strftime("%d-%m-%Y"))
                        else:
                            envelop_info = 'This invoice have been sent.'
                        remove_cross_button = True
                    else:
                        color = '#df2873'
                        cross_button_info = 'Cancel send email ? For your information email are sent every hours (e.g : 9 am - 10 am - 11 am...)'
                        if o.due_date:
                            envelop_info = 'This invoice will be send on the ' + str(o.due_date.strftime("%d-%m-%Y")) + ' or before due date '
                else:
                    envelop_info = 'Only validated invoices can be automatically sent, please validate this invoice'
                    remove_cross_button = True

                Customer_list.append({'id': o.id,
                                      'uuid':str(o.encrypt_id),
                                      'customer': o.customer_name,
                                      'invoice_date': invoice_date,
                                      'invoice_number': o.name,
                                      'checkbox_email': o.checkbox_email,
                                      'sales_person': user_obj.username,
                                      'due_date': due_date,
                                      'due_dated': due_dated,
                                      'email_due_date': email_due_date,
                                      'source_document': o.quotation_name,
                                      'total': utils.round_value(o.total_amount),
                                      'amount_due': utils.round_value(o.amount_due),
                                      'status': o.status, 'can_remove': can_remove,
                                      'remove_cross_button': remove_cross_button,
                                      'color': color,
                                      'envelop_info': envelop_info,
                                      'cross_button_info': cross_button_info,
                                      })

                if o.total_amount is not None:
                    total_amount = utils.round_value(total_amount + float(o.total_amount))

    data['currency'] = currency
    data['Customer'] = Customer_list
    data['total_amount'] = total_amount

    return HttpResponse(json.dumps(data), content_type="application/json")


def customerinvoicelistdata(request, list_id):
    utils = Utils()

    data = {}
    company_id = request.user.profile.company_id
    user_obj = request.user
    currency = get_currency_name(company_id)

    total_amount = 0
    Customer_list = []

    limit = settings.PAGGING_LIMIT
    offset = ""

    if request.method == "POST":
        json_data = json.loads(request.POST['fields'])
        parameter = formatFields(json_data)
        dic_name = json.loads(request.POST['names'])
        dic_total = json.loads(request.POST['total_amount'])
        dic_customer = json.loads(request.POST['customer'])
        query = Q()
        total = Q()
        customer = Q()
        offset = int(parameter['offset'])
        limit = offset + int(limit)
        orderby = '-name'
        try:
            sales_order = Sale_order.objects.get(uuid=list_id)
            if sales_order:
                Customer = Customer_invoice.objects.filter(quotation_id=sales_order.id)
                like_cond = Q()
                if len(dic_name) > 0:
                    for name in dic_name:
                        query = query | Q(name__icontains=name)
                    Customer = Customer.filter(query)
                if len(dic_total) > 0:
                    for totale in dic_total:
                        total = total | Q(total_amount__icontains=totale)
                    Customer = Customer.filter(total)
                if len(dic_customer) > 0:
                    for customers in dic_customer:
                        customer = customer | Q(customer_name__icontains=customers)
                    Customer = Customer.filter(customer)

                total_unit = len(Customer)
                Customer = Customer.order_by(orderby)
                Customer = Customer[offset:limit]
                data['total_count'] = total_unit
                if len(Customer) > 0:
                    for o in Customer:
                        invoice_date = None
                        due_date = None
                        due_dated = 'after'
                        email_due_date = ''

                        if o.invoice_date is not None:
                            invoice_date = o.invoice_date.strftime('%d-%m-%Y')
                        if o.due_date is not None:
                            if date.today() > o.due_date and o.status != 'paid':
                                due_dated = 'before'
                            else:
                                due_dated = 'after'

                            due_date = o.due_date.strftime('%d-%m-%Y')
                            mon_rel = relativedelta(days=5)
                            email_du_date = o.due_date - mon_rel
                            email_due_date = email_du_date.strftime('%d-%m-%Y')

                        can_remove = False;
                        if o.status == 'draft' or o.status == 'cancel':
                            can_remove = True

                        remove_cross_button = False
                        color = '#777'
                        envelop_info = ''
                        cross_button_info = ''
                        if o.status == 'open':
                            if o.email_sent_by_cron:
                                color = '#008000'
                                if o.email_sent_on:
                                    envelop_info = 'This invoice have been sent on the ' + str(
                                        (o.email_sent_on).strftime("%d-%m-%Y"))
                                else:
                                    envelop_info = 'This invoice have been sent.'
                                remove_cross_button = True
                            else:
                                color = '#df2873'
                                cross_button_info = 'Cancel send email ? For your information email are sent every hours (e.g : 9 am - 10 am - 11 am...)'
                                envelop_info = 'This invoice will be send on the ' + str(
                                    o.due_date.strftime("%d-%m-%Y")) + ' or before due date '
                        else:
                            envelop_info = 'Only validated invoices can be automatically sent, please validate this invoice'
                            remove_cross_button = True
                        Customer_list.append({
                            'id': o.id,
                            'uuid':str(o.encrypt_id),
                            'customer': o.customer_name,
                            'invoice_date': invoice_date,
                            'invoice_number': o.name,
                            'checkbox_email': o.checkbox_email,
                            'sales_person': user_obj.username,
                            'due_date': due_date,
                            'due_dated': due_dated,
                            'email_due_date': email_due_date,
                            'source_document': o.quotation_name,
                            'total': utils.round_value(o.total_amount),
                            'amount_due': utils.round_value(o.amount_due),
                            'status': o.status,
                            'can_remove': can_remove,
                            'remove_cross_button': remove_cross_button,
                            'color': color,
                            'envelop_info': envelop_info,
                            'cross_button_info': cross_button_info,
                        })
                        if o.total_amount is not None:
                            total_amount = utils.round_value(total_amount + float(o.total_amount))
                data['currency'] = currency
                data['Customer'] = Customer_list
                data['total_amount'] = utils.round_value(total_amount)
        except Sale_order.DoesNotExist:
            data['success'] = False
        return HttpResponse(json.dumps(data), content_type="application/json")


def customerinvoicetotal(request, uuid):
    utils = Utils()
    data = {}
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    total_amount = 0
    tax_amount = 0
    Customer_list = []
    can_remove = True

    try:
        res = Sale_order.objects.get(uuid=uuid, company_id=company_id)
        if res:
            invoice_id = res.id
            Customer = Customer_invoice.objects.filter(quotation_id=invoice_id)

            if len(Customer) > 0:
                for o in Customer:
                    invoice_date = None
                    due_date = None
                    if o.invoice_date is not None:
                        invoice_date = o.invoice_date.strftime('%d-%m-%Y')
                    if o.due_date is not None:
                        due_date = o.due_date.strftime('%d-%m-%Y')

                    Customer_list.append({'id': o.id,
                                          'customer': o.customer_name,
                                          'invoice_date': invoice_date,
                                          'invoice_number': o.name,
                                          'sales_person': user_obj.username,
                                          'due_date': due_date,
                                          'source_document': o.quotation_name,
                                          'total': utils.round_value(o.total_amount),
                                          'subtotal_amount':utils.round_value( o.subtotal_amount),
                                          'tax_amount': utils.round_value(o.tax_amount),
                                          'amount_due': utils.round_value(o.amount_due),
                                          'status': o.status,
                                          'can_remove': can_remove,
                                          })
                    if o.subtotal_amount is not None:
                        total_amount = total_amount + float(o.subtotal_amount)

                    if o.tax_amount is not None:
                        tax_amount = tax_amount + float(o.tax_amount)
            data['Customer'] = Customer_list
            data['total_amount'] = float(total_amount)
            data['tax_amount'] = float(tax_amount)
            data['total_Invoicing_data'] = len(Customer_list)
    except Sale_order.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type="application/json")


def pdf_html(request, encrypt_id):
    data = {}
    data['success'] = False
    pdf_obj = Customer_invoice.objects.get(encrypt_id=encrypt_id)
    if pdf_obj:
        company_id = pdf_obj.company_id
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)
        context = getInvoiceData(preview_id, company_id, user_id, roles, currency)
        pdiscount = False
        context['pdiscount'] = pdiscount
        context['is_product_discount'] = pdiscount
        context['print_link'] = '/generate_pdf/' + encrypt_id + '/invoice/'
        context['first_date_label'] = 'Expiration Date :'
        context['second_date_label'] = 'Invoice Date :'
        return render(request, 'web/quotation/pdf_html.html', context)

def pdf_download(request, encrypt_id):
    data = {}
    data['success'] = False
    pdf_obj = Customer_invoice.objects.get(encrypt_id=encrypt_id)
    if pdf_obj:
        company_id = pdf_obj.company
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)
        context = getInvoiceData(preview_id, company_id, user_id, roles, currency)
        pdiscount = False
        context['is_product_discount'] = pdiscount
        context['is_opt_discount'] = pdiscount
        return render(request, 'web/customer_invoice/home_page.html', context)


def invoice_header(request, encrypt_id, report_for):
    data = {}
    data['success'] = False
    pdf_obj = Customer_invoice.objects.get(encrypt_id=encrypt_id)
    if pdf_obj:
        company_id = pdf_obj.company
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)
        context = getInvoiceData(preview_id, company_id, user_id, roles, currency, report_for)
        pdiscount = False
        context['pdiscount'] = pdiscount
        context['first_date_label'] = 'Expiration Date :'
        context['second_date_label'] = 'Invoice Date :'
        return render(request, 'web/quotation/header.html', context)


def invoice_footer(request, encrypt_id):
    data = {}
    data['success'] = False
    pdf_obj = Customer_invoice.objects.get(encrypt_id=encrypt_id)
    if pdf_obj:
        company_id = pdf_obj.company
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)
        context = getInvoiceData(preview_id, company_id, user_id, roles, currency)
        pdiscount = False
        context['pdiscount'] = pdiscount
        return render(request, 'web/quotation/footer.html', context)


def getInvoiceData(id, company_id, user_id, roles, currency, report_for=None):
    try:
        quatations_obj = Customer_invoice.objects.get(pk=int(id))
        customer_name = ''
        customer_id = ''
        if quatations_obj.customer_id is not None:
            customer_id = quatations_obj.customer_id
            customer_name = quatations_obj.customer_name
        payment_term_id = ''
        pay_tm_name = ''
        if quatations_obj.payment_term is not None:
            payment_term_id = quatations_obj.payment_term_id
            pay_tm_name = quatations_obj.payment_term.name
        profile_image = ''
        profile_image1 = ''
        contactp = Contact.objects.get(id=customer_id)
        fields = {"Street": '', "Street2": '', "City": '', "State": '', "Country": '', "Zip": '', "Mobile": ''}
        if contactp is not None:
            contact_field_value_id = contactp.email
            profile_image = contactp.profile_image
            mainurl = settings.HOST_NAME
            profile_image1 = mainurl + profile_image
            address_street = contactp.street if contactp.street is not None else ''
            address_street2 = contactp.street2 if contactp.street2 is not None else ''
            address_city = contactp.city if contactp.city is not None else ''
            address_country = contactp.country if contactp.country is not None else ''
            address_zip = contactp.zip if contactp.zip is not None else ''
            mobile = fields['Mobile'] if fields['Mobile'] is not None else ''

        company_name = ''
        company_logo = None
        company_street = None
        company_city = None
        company_zip = None
        company_country = None
        companytp = Company.objects.filter(id=company_id)
        if companytp is not None:
            for cpt in companytp:
                company_name = cpt.company
                cuser_id = cpt.user_id
                company_billing_company_name = cpt.billing_company_name if cpt.billing_company_name is not None else ''
                company_address_billing_street = cpt.billing_street if cpt.billing_street is not None else ''
                company_address_billing_city = cpt.billing_city if cpt.billing_city is not None else ''
                company_address_billing_country = cpt.billing_country if cpt.billing_country is not None else ''
                company_address_billing_zip = cpt.billing_zip if cpt.billing_zip is not None else ''
                company_street = cpt.street if cpt.street is not None else ''
                company_city = cpt.city if cpt.city is not None else ''
                company_zip = cpt.zip if cpt.zip is not None else ''
                company_country = cpt.country.label if cpt.country is not None else ''
                company_logo = settings.HOST_NAME_WITHOUT_SLASH + cpt.profile_image if cpt.profile_image else None

        email = ''
        legacy_information = ''

        user_detail = User.objects.get(id=user_id)
        if user_detail:
            email = user_detail.email
            legacy_information = user_detail.company.quotation_legacy_information

        phone = ''
        profile_detail = Profile.objects.filter(user_id=customer_id)
        if profile_detail is not None:
            for ptp in profile_detail:
                phone = ptp.phone

        json_address = view_field_value(company_id, customer_id)
        address_json = ''

        terms_conditions = None
        if quatations_obj.notes:
            terms_conditions = quatations_obj.notes
        elif user_detail and user_detail.company.invoice_term_and_condition:
            terms_conditions = user_detail.company.invoice_term_and_condition

        due_date = ''
        if quatations_obj.due_date != "" and quatations_obj.due_date is not None:
            new_dt1 = str(quatations_obj.due_date);
            due_date = datetime.datetime.strptime(new_dt1, "%Y-%m-%d").strftime("%d/%m/%Y")
        else:
            due_date = None

        invoice_date = ''
        if quatations_obj.invoice_date != "" and quatations_obj.invoice_date is not None:
            new_dt2 = str(quatations_obj.invoice_date);
            invoice_date = datetime.datetime.strptime(new_dt2, "%Y-%m-%d").strftime("%d/%m/%Y")
        else:
            invoice_date = None

        report_name = quatations_obj.name
        if report_for and report_for == 'invoice':
            report_name = 'Your Invoice ' + quatations_obj.name

        quotation_dict = {
            'id': quatations_obj.id,
            'user_id': quatations_obj.create_by_user_id,
            'name': report_name,
            'phone': phone,
            'email': email,
            'currency': currency,
            'company_name': company_name,
            'company_logo': company_logo,
            'company_billing_company_name': company_billing_company_name,
            'company_address_billing_street': company_address_billing_street,
            'company_address_billing_city': company_address_billing_city,
            'company_address_billing_country': company_address_billing_country,
            'company_address_billing_zip': company_address_billing_zip,
            'company_street': company_street,
            'company_zip': company_zip,
            'company_city': company_city,
            'company_country': company_country,
            'address_street': address_street,
            'address_street2': address_street2,
            'address_city': address_city,
            'address_state': '',
            'address_country': address_country,
            'address_zip': address_zip,
            'customer_address': address_json,
            'mobile': mobile,
            'company_name': company_name,
            'customer_id': customer_id,
            'customer_name': customer_name,
            'profile_image': profile_image,
            'profile_image1': profile_image1,
            'customer_email': contact_field_value_id,
            'order_date1': due_date,
            'expiration_date1': invoice_date,
            'payment_term': payment_term_id,
            'pay_tm_name': pay_tm_name,
            'amount_untaxed': quatations_obj.subtotal_amount,
            'tax_amount': quatations_obj.tax_amount,
            'total_amount': quatations_obj.total_amount,
            'status': quatations_obj.status,
            'invoice_status': quatations_obj.invoice_status,
            'legacy_information': legacy_information,
            'notes': terms_conditions,

        }
        quotation_dict['products'] = getQuotationProduct(quatations_obj.id, 'order', company_id, user_id, roles)
        display_tax_return_data = display_tax_calculation(quotation_dict['products'])
        quotation_dict['tax_amount'] = display_tax_return_data['total_tax']
        quotation_dict['multiple_tax'] = display_tax_return_data['multiple_tax_list']
        return quotation_dict
    except Sale_order.DoesNotExist:
        return None


def view_field_value(user_company_id, contact_id):
    contact_id = str(contact_id)
    tab = []
    contact_tabs = ContactTab.objects.all().filter(company_id=user_company_id).order_by('display_weight')

    if contact_tabs is not None:
        for o in contact_tabs:
            tab_dic = {'tab_id': o.id, 'tab_name': o.name, 'is_default': o.is_default, 'fields': []}
            field_ids = ', '.join([str(x) for x in o.fields])
            contact_fields = ContactFieldsValue.contact_field_value_data(contact_id, field_ids)

            for f in contact_fields:
                contact_field_value_id = ''
                contact_field_value = '-'
                if f.contact_field_value_id is not None and f.contact_field_value is not None:
                    contact_field_value_id = f.contact_field_value_id
                    contact_field_value = f.contact_field_value
                if f.type == 'radio' and f.contact_field_value:
                    radio_value = '-'
                    try:
                        radio = ast.literal_eval(f.contact_field_value)
                        for r in radio:
                            if r['checked']:
                                radio_value = r['value']
                            contact_field_value = radio_value
                    except:
                        contact_field_value = radio_value
                if f.type == 'checkbox' and f.contact_field_value:
                    checkbox = ast.literal_eval(f.contact_field_value)
                    checkbox_list = []
                    try:
                        for c in checkbox:
                            if c['checked']:
                                checkbox_list.append(c['value'])
                            contact_field_value = ', '.join(checkbox_list)
                    except:
                        contact_field_value = ', '.join(checkbox_list)

                if f.type == 'multiselect' and f.contact_field_value:
                    tag_list = []
                    try:
                        tags = ast.literal_eval(f.contact_field_value)
                        for t in tags:
                            tag_list.append({'color': t['color'], 'name': t['name']})
                        contact_field_value = tag_list
                    except:
                        contact_field_value = tag_list
                fields_dic = {'id': f.id, 'name': f.label, 'display_position': f.display_position,
                              'field_value_id': contact_field_value_id, 'value': contact_field_value,
                              'type': f.type
                              }
                tab_dic['fields'].append(fields_dic)
            tab.append(tab_dic)
    return tab




@login_required(login_url="/login/")
def viewdata(request, view_id):
    data = {}
    data['success'] = False

    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    maxnum = []
    Uncounil_Payment_data = []
    currency = get_currency_name(company_id)
    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = ["ADMIN"]

    edit_link = False

    invoice_data = Customer_invoice.objects.get(encrypt_id=view_id)
    if 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_MANAGE_ALL_QUOTATION' in roles or request.user.id == invoice_data.created_by_user_id:
        edit_link = True
        if invoice_data.status == 'open' or invoice_data.status == 'paid':
            edit_link = False

    contact_field_valuet_data = Payment_register.objects.filter(Q(unreconcile=1) | Q(unreconcile=2))
    if len(contact_field_valuet_data) > 0:
        for x_data in contact_field_valuet_data:
            pcustomer_invoice_id = x_data.customer_invoice_id
            invoice_data_customer = Customer_invoice.objects.filter(pk=pcustomer_invoice_id)
            for xy in invoice_data_customer:
                customer_id = xy.customer_id
            main_customer_id = invoice_data.customer_id

            if customer_id == main_customer_id:

                invoice_data_customer1 = Customer_invoice.objects.filter(customer_id=customer_id)
                for x in invoice_data_customer1:
                    invoice_id = x.id
                    contact_field_valuet_last = Payment_register.objects.filter(
                        customer_invoice_id=invoice_id).filter(
                        Q(unreconcile=1) | Q(unreconcile=2))
                    if len(contact_field_valuet_last) > 0:
                        for xydata1 in contact_field_valuet_last:
                            reg_id = xydata1.id
                            contact_field_valuet_last1 = Payment_register_record.objects.filter(
                                payment_register_id=reg_id).filter(Q(unreconcile=1) | Q(unreconcile=2))
                            if len(contact_field_valuet_last1) > 0:
                                for xydata in contact_field_valuet_last:
                                    Uncounil_Payment_data.append({'piid': xydata.id,
                                                                  'picustomer_invoice_id': xydata.customer_invoice_id,
                                                                  'picustomer_invoice_name': xydata.payment_memo,
                                                                  'picustomer_invoice_payment': xydata.payment_amount,
                                                                  'picustomer_invoice_total_payment': xydata.total_payment_amount,
                                                                  'picustomer_invoice_diffrence': xydata.payment_difference,
                                                                  'picustomer_invoice_unreconcile': xydata.unreconcile
                                                                  })

    if invoice_data.invoice_date is not None:
        invoice_date = invoice_data.invoice_date.strftime('%d-%m-%Y')
    else:
        invoice_date = ''

    if invoice_data.due_date is not None:
        due_date_default = str(invoice_data.due_date.strftime('%d-%m-%Y'))
    else:
        due_date_default = ''

    payment_term_days = ''
    invoice_Taxes_name = ''

    if invoice_data.payment_term_id is not None and invoice_data.payment_term_id != '':

        pay_obj = Term.objects.filter(payment_term=invoice_data.payment_term_id).order_by('order')

        if len(pay_obj) > 0:
            for pay_objs in pay_obj:
                TODAY = date.today()
                number_days = pay_objs.number_days if pay_objs.number_days != '' else 0
                now = datetime.datetime.now()
                nowyear = now.year
                nowmonth = now.month
                followingmonth = now.month + 1
                if pay_objs.days == 'invoice':
                    mon_rel = relativedelta(days=int(number_days))
                    due_date = TODAY + mon_rel
                elif pay_objs.days == 'end_invoice':
                    last = last_day_of_month(nowyear, nowmonth)
                    mon_rel = relativedelta(days=int(number_days))
                    due_date = last + mon_rel

                elif pay_objs.days == 'following_month':
                    last = last_day_of_month(nowyear, followingmonth)
                    due_date = last


                elif pay_objs.days == 'current_month':
                    last = last_day_of_month(nowyear, nowmonth)
                    due_date = last

                dateq = str(due_date)
                maxnum.append((dateq))
            payment_term_days = max(maxnum)

    if invoice_data.Taxes is not None and invoice_data.Taxes != '':
        invoice_Taxes_name = invoice_data.Taxes.name
    else:
        invoice_Taxes_name = None

    order_date1 = ''

    if invoice_data.name != "" and invoice_data.name is not None:
        invoice_name = invoice_data.name
    else:
        invoice_name = None

    if invoice_data.quotation_id != "" and invoice_data.quotation_id is not None:
        invoice_quotation_id = invoice_data.quotation_id
    else:
        invoice_quotation_id = None

    if invoice_data.quotation_name != "" and invoice_data.quotation_name is not None:
        invoice_quotation_name = invoice_data.quotation_name
    else:
        invoice_quotation_name = None

    payment_term_id = ''
    pay_tm_name = ''
    if invoice_data.payment_term is not None:
        payment_term_id = invoice_data.payment_term_id
        pay_tm_name = invoice_data.payment_term.name

    notes = None
    if invoice_data.notes:
        notes = invoice_data.notes
    elif request.user.company.invoice_term_and_condition:
        notes = request.user.company.invoice_term_and_condition
    Invoicing_data = {'id': invoice_data.id,
                      'uuid':str(invoice_data.encrypt_id),
                      'name': invoice_name,
                      'customer_name': invoice_data.customer_name,
                      'customer_id': invoice_data.customer_id,
                      'invoice_date': invoice_date,
                      'due_date': due_date_default,
                      'currency': currency,
                      'url': str(invoice_data.encrypt_id),
                      'payment_term': payment_term_id,
                      'pay_tm_name': pay_tm_name,
                      'payment_term_days': payment_term_days,
                      'sales_person': invoice_data.sales_person,
                      'quotation_id': invoice_quotation_id,
                      'quotation_name': invoice_quotation_name,
                      'invoice_status': invoice_data.invoice_status,
                      'status': invoice_data.status,
                      'total_amount': float(invoice_data.total_amount),
                      'subtotal_amount': float(invoice_data.subtotal_amount),
                      'amount_due': float(invoice_data.amount_due),
                      'tax_amount': float(invoice_data.tax_amount),
                      'Taxes': invoice_Taxes_name,
                      'edit_link': edit_link,
                      'notes': notes
                      }
    Invoicing_data['products'] = getQuotationProduct(invoice_data.id, 'order', company_id, user_id, roles)
    display_tax_return_data = display_tax_calculation(Invoicing_data['products'])
    Invoicing_data['tax_amount'] = display_tax_return_data['total_tax']
    Invoicing_data['payment'] = getPaymentRegister(invoice_data.id)
    if Invoicing_data is not None:
        data['Invoicing'] = Invoicing_data
        data['Invoicing']['multiple_tax'] = display_tax_return_data['multiple_tax_list']
        data['Uncounil_Payment_data'] = Uncounil_Payment_data
        data['user_id'] = user_id
        data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def getOpIdList(request, company_id):
    op_id_list = []
    op_objs = Customer_invoice.objects.filter(company=company_id).order_by('id')

    for op in op_objs:
        op_id_list.append({'id': op.id})

    return op_id_list


def Unreconcile(request, invoice_id):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    maxnum = []
    json_data = json.loads(request.POST['fields'])
    p_total = 0

    try:
        invoice_obj = Customer_invoice.objects.get(pk=int(invoice_id))
        total_amount = invoice_obj.total_amount
        amount_due = invoice_obj.amount_due

        if json_data['unreconcile'] == 0:

            main_value = amount_due - json_data['idpayment_amount']
            if main_value <= 0:

                uppaymnt1 = Payment_register.objects.get(id=json_data['id'])
                uppaymnt1.unreconcile = 2
                uppaymnt1.payment_difference = abs(main_value)
                uppaymnt1.payment_amount = amount_due
                invoice_obj.status = 'paid'
                invoice_obj.amount_due = 0
                uppaymnt1.save()

                if uppaymnt1.customer_invoice_id == json_data['invoice_id']:
                    uppaymnt = Payment_register_record.objects.get(payment_register_id=json_data['id'])
                    uppaymnt.customer_invoice_id = json_data['invoice_id']
                    uppaymnt.unreconcile = 2
                    uppaymnt.payment_difference = abs(main_value)
                    uppaymnt.payment_amount = amount_due
                    uppaymnt.save()
                else:
                    uppaymnt = Payment_register_record()
                    uppaymnt.customer_invoice_id = json_data['invoice_id']
                    uppaymnt.unreconcile = 2
                    uppaymnt.payment_difference = abs(main_value)
                    uppaymnt.payment_amount = amount_due
                    uppaymnt.payment_journal = uppaymnt.payment_journal
                    uppaymnt.payment_memo = uppaymnt.payment_amount
                    uppaymnt.payment_register_id = json_data['id']
                    uppaymnt.total_payment_amount = amount_due
                    uppaymnt.save()

            else:
                uppaymnt = Payment_register_record.objects.get(payment_register_id=json_data['id'])
                uppaymnt.customer_invoice_id = json_data['invoice_id']
                uppaymnt.unreconcile = json_data['unreconcile']
                uppaymnt.payment_difference = 0
                uppaymnt.payment_amount = json_data['idpayment_amount']
                uppaymnt.save()

                uppaymnt1 = Payment_register.objects.get(id=json_data['id'])
                uppaymnt1.unreconcile = json_data['unreconcile']
                uppaymnt1.payment_difference = 0
                uppaymnt1.payment_amount = json_data['idpayment_amount']
                uppaymnt1.save()
                invoice_obj.status = 'open'
                invoice_obj.amount_due = main_value
        else:

            uppaymnt = Payment_register_record.objects.get(payment_register_id=json_data['id'])
            total_amount = uppaymnt.total_payment_amount
            uppaymnt.customer_invoice_id = json_data['invoice_id']
            uppaymnt.unreconcile = json_data['unreconcile']
            uppaymnt.payment_difference = total_amount
            uppaymnt.payment_amount = total_amount
            uppaymnt.save()

            uppaymnt1 = Payment_register.objects.get(id=json_data['id'])

            total_amount = uppaymnt1.total_payment_amount
            uppaymnt1.customer_invoice_id = json_data['invoice_id']
            uppaymnt1.unreconcile = json_data['unreconcile']
            uppaymnt1.payment_difference = total_amount
            uppaymnt1.payment_amount = total_amount
            uppaymnt1.save()

            invoice_obj.status = 'open'
            main_value = amount_due + json_data['idpayment_amount']
            invoice_obj.amount_due = main_value

        invoice_obj.save()
        data['success'] = True



    except Customer_invoice.DoesNotExist:
        pass

    return HttpResponse(json.dumps(data), content_type='application/json')


def getPaymentRegister(id):
    payment_record_list = []

    payment_dict = Payment_register.objects.filter(customer_invoice_id=id).order_by('id')
    for payment_d in payment_dict:
        pid = payment_d.id
        reason = payment_d.reason
        unreconcile = payment_d.unreconcile
        payment_difference = payment_d.payment_difference

        payment_dict1 = Payment_register_record.objects.filter(payment_register_id=pid).order_by('id')
        if len(payment_dict1) > 0:
            for o in payment_dict1:
                payment_record_list.append({

                    'id': pid,
                    'payment_amount': o.payment_amount,
                    'payment_date': o.payment_date.strftime('%d-%m-%Y'),
                    'payment_journal': o.payment_journal,
                    'payment_memo': o.payment_memo,
                    'payment_difference': o.payment_difference,
                    'customer_invoice_id': o.customer_invoice_id,
                    'reason': reason,
                    'unreconcile': o.unreconcile,
                })

    return payment_record_list


def getPaymentRegisterData(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    ids = json.loads(request.POST['fields'])
    payment_record_list = []
    payment_dict = Payment_register.objects.get(id=ids)

    data['id'] = payment_dict.id
    data['payment_amount'] = payment_dict.payment_amount
    data['payment_date'] = payment_dict.payment_date.strftime('%d-%m-%Y')
    data['payment_journal'] = payment_dict.payment_journal

    data['payment_memo'] = payment_dict.payment_memo
    data['payment_difference'] = payment_dict.payment_difference
    data['customer_invoice_id'] = payment_dict.customer_invoice_id
    data['reason'] = payment_dict.reason
    data['unreconcile'] = payment_dict.unreconcile

    data['success'] = True

    return HttpResponse(json.dumps(data), content_type="application/json")


def getQuotationProduct(id, line_type, company_id, user_id, roles):
    utils = Utils()
    pro_record_list = []
    s_o_r_dict = Sale_order_record.objects.select_related().filter(invoice_id=id).order_by('id')
    if len(s_o_r_dict) > 0:
        for o in s_o_r_dict:
            uom_name = ''
            product_name = 'Product Deleted'
            tax_id = ''
            tax_name = ''
            tax_computation = None
            tax_value = None
            product_uuid = None

            if o.Product is not None:
                product_name = o.Product.internal_reference if o.Product.internal_reference is not None else ''
                product_name = product_name + ' '
                product_name = product_name + o.Product.template_name if o.Product.template_name is not None else ''
                if o.Taxes is not None:
                    tax_id = o.Taxes.id
                    tax_name = o.Taxes.name
                    tax_computation = o.Taxes.computation
                    tax_value = o.Taxes.value
                    print("Product Tax", o.Taxes.value, tax_value)
            else:
                product_name = 'Down Payment'
            if o.product_uom:
                uom_name = o.product_uom.name

            if o.Product_id:
                product_uuid = str(o.Product.uuid)
            pro_record_list.append({

                'id': o.id,
                'uuid': product_uuid,
                'Product': o.Product_id,
                'product_name': product_name,
                'product_description': o.discription,
                'customer': o.customer,
                'sales_person': o.sales_person,
                'product_qty': o.product_qty,
                'product_uom': o.product_uom_id,
                'product_uom_name': uom_name,
                'product_tax_id': tax_id,
                'product_tax_name': tax_name,
                'product_tax_value': utils.round_value(tax_value),
                'product_tax_computation': tax_computation,
                'unit_price': utils.round_value(o.unit_price),
                'tax_price': utils.round_value(o.tax_price),
                'price_subtotal': utils.round_value(o.price_subtotal),
                'price_total': utils.round_value(o.price_total),
                'price_reduce': utils.round_value(o.price_reduce),
                'discount': utils.round_value(o.discount),
            })
    return pro_record_list


def getPorTaxes(company_id, user_id, roles):
    utils = Utils()
    taxes_list = []
    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        taxes_obj = Product_taxes.objects.filter(scope='sale', company=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        taxes_obj = Product_taxes.objects.filter(scope='sale', user_id=user_id)
    for o in taxes_obj:
        taxes_list.append(
            {'id': o.id, 'name': o.name, 'value': utils.round_value(o.value), 'computation': o.computation})

    return taxes_list


@login_required(login_url="/login/")
def saveCustomerInvoice(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    json_data = json.loads(request.POST['fields'])

    currency_name = Company.objects.filter(id=company_id)
    for currency_name_ob in currency_name:
        currency = currency_name_ob.currency
    customer_invoice_obj = Customer_invoice()

    customer_invoice_obj.company_id = company_id
    customer_invoice_obj.create_by_user = user_obj
    customer_invoice_obj.sales_person = user_id
    customer_invoice_obj.status = 'draft'

    if 'customer_id' in json_data and json_data['customer_id'] != '' and int(json_data['customer_id']) > 0:
        customer_invoice_obj.customer_id = int(json_data['customer_id'])

    if 'customer_name' in json_data and json_data['customer_name'] != '':
        customer_invoice_obj.customer_name = json_data['customer_name']

    if 'payment_term' in json_data and json_data['payment_term']:
        customer_invoice_obj.payment_term_id = int(json_data['payment_term'])

    if 'tax_amt' in json_data and json_data['tax_amt'] != '':
        customer_invoice_obj.tax_amount = int(json_data['tax_amt'])

    if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
        customer_invoice_obj.subtotal_amount = float(json_data['untaxed_amt'])

        if 'tax_amt' in json_data and json_data['tax_amt'] != '':
            customer_invoice_obj.total_amount = float(json_data['untaxed_amt']) + float(json_data['tax_amt'])
            customer_invoice_obj.amount_due = float(json_data['untaxed_amt']) + float(json_data['tax_amt'])

        else:
            customer_invoice_obj.total_amount = float(json_data['untaxed_amt'])
            customer_invoice_obj.amount_due = float(json_data['untaxed_amt'])

    TODAY = datetime.date.today()
    mon_rel = relativedelta(months=1)
    expiration_date_else = TODAY + mon_rel
    if 'due_date' in json_data and json_data['due_date'] != '':
        customer_invoice_obj.due_date = datetime.datetime.strptime(json_data['due_date'], "%m/%d/%Y")
    else:
        customer_invoice_obj.due_date = expiration_date_else

    if 'invoice_date' in json_data and json_data['invoice_date'] != '':

        customer_invoice_obj.invoice_date = datetime.datetime.strptime(json_data['invoice_date'], "%m/%d/%Y")
    else:
        customer_invoice_obj.invoice_date = datetime.date.today()

    if 'notes' in json_data:
        customer_invoice_obj.notes = json_data['notes']

    customer_invoice_obj.save()

    so_id = customer_invoice_obj.id
    customer_id = customer_invoice_obj.customer_id

    if so_id > 0:
        #addProduct(json_data['products'], 'order', customer_invoice_obj, user_obj, company_id, customer_id)
        addProduct(json_data['products'], 'order', customer_invoice_obj, user_obj, company_id, customer_id)
        contact_change_status(customer_id, 'customer')
        message = 'Invoice '  + ' has been created by ' + request.user.get_full_name()
        action_dic = {'company_id': company_id, 'message': message, 'module_name': 'invoice',
                      'module_object': customer_invoice_obj, 'user': request.user, 'module_id': 2}
        message_create_for_create_action(action_dic)

    data['success'] = True
    data['id'] = so_id
    data['encrypt_id'] = str(customer_invoice_obj.encrypt_id)

    return HttpResponse(json.dumps(data), content_type="application/json")


def UpdateInvoiceStatus(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    maxnum = []
    status = request.POST['status']
    encrypt_id = request.POST['q_id']

    try:
        invoice_obj = Customer_invoice.objects.get(encrypt_id=encrypt_id,company=company_id)
        invoice_obj.status = status
        customer_Invoice = Customer_invoice.objects.all()
        for x in customer_Invoice:
            maxnum.append(x.name)
            maxnum_result = max(maxnum)

        character_remove = maxnum_result
        intd = character_remove[9:]
        intlist = 1
        name = 'INV/'
        now = datetime.datetime.now()
        year = now.year
        name = name + str(year)

        if maxnum_result != '':
            maxnum = intlist + int(intd)
            if len(str(maxnum)) == 1:
                name = name + '/' + '000' + str(maxnum)
            elif len(str(maxnum)) == 2:
                name = name + '/' + '00' + str(maxnum)
            elif len(str(maxnum)) == 3:
                name = name + '/' + '0' + str(maxnum)
            elif len(str(maxnum)) > 3:
                name = name + '/' + str(maxnum)
        else:
            name = name + '/0001'

        if status == 'draft':
            invoice_obj.name = ''
            invoice_obj.status = 'draft'
            invoice_obj.amount_due = 0
            invoice_obj.save()
            message = 'Invoice ' + "\"" + invoice_obj.name + "\"" + ' status ' + invoice_obj.status +' has been changed by ' + request.user.get_full_name()
            action_dic = {'company_id': company_id, 'message': message, 'module_name': 'invoice',
                          'module_object': invoice_obj, 'user': request.user, 'module_id': 2}
            message_create_for_create_action(action_dic)
            try:
                payment_register = Payment_register.objects.filter(customer_invoice_id=invoice_obj.id, company_id=company_id)
                print("payment_register", payment_register)
                if payment_register:
                    payment_register.delete()
                    data['success'] = True
            except Payment_register.DoesNotExist:
                data['success'] = False

        elif status == 'open':
            invoice_obj.name = name
            if invoice_obj.invoice_date != "" and invoice_obj.invoice_date is not None:
                invoice_obj.invoice_date = invoice_obj.invoice_date
            else:
                invoice_obj.invoice_date = datetime.date.today()

            '''if json_data['payment_term_days'] != '' and json_data['payment_term_days'] is not None:
                end_date = json_data['payment_term_days']
                if invoice_obj.due_date != "" and invoice_obj.due_date is not None:
                    invoice_obj.due_date = invoice_obj.due_date
                else:
                    invoice_obj.due_date = end_date
                invoice_obj.amount_due = json_data['total_amount']
            else:
                if invoice_obj.due_date != "" and invoice_obj.due_date is not None:
                    invoice_obj.due_date = invoice_obj.due_date
                else:
                    invoice_obj.due_date = datetime.date.today()
                invoice_obj.amount_due = json_data['total_amount']'''
            invoice_obj.save()
            data['success'] = True


    except Customer_invoice.DoesNotExist:
        pass

    return HttpResponse(json.dumps(data), content_type='application/json')


def getPaymentTerms(company_id, user_id, roles):
    pt_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        pt_objs = Payment_term.objects.filter(company=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        pt_objs = Payment_term.objects.filter(create_by_user_id=user_id)

    for o in pt_objs:
        pt_list.append({'id': o.id, 'name': o.name})

    return pt_list


def getProduct(company_id, user_id, roles):
    product_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        product_objs = Product.objects.filter(product_tmpl__can_be_sold=1, company=company_id).order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        product_objs = Product.objects.filter(product_tmpl__can_be_sold=1, create_by_user_id=user_id).order_by('id')

    for pro in product_objs:
        prodcut_name = ''
        if pro.template_name is not None:
            prodcut_name = pro.template_name
            product_list.append({'id': pro.id, 'uuid':str(pro.uuid), 'name': prodcut_name})

    return product_list


def addProduct(products, line_type, invoice_obj, user_obj, company_id, customer_id):
    for pro in products:
        if pro['product_id'] is not None and pro['product_id'] != '':
            product = Product.objects.get(uuid=pro['product_id'], company_id=company_id)
            if product:
                so_record_obj = Sale_order_record()
                so_record_obj.invoice = invoice_obj
                so_record_obj.discription = pro['description']
                so_record_obj.customer = customer_id
                so_record_obj.Product_id = product.id
                so_record_obj.company_id = company_id
                so_record_obj.create_by_user = user_obj
                so_record_obj.product_qty = pro['order_qty']
                so_record_obj.product_uom_id = int(pro['uom']) if 'uom' in pro and pro['uom'] != '' else None
                so_record_obj.discount = float(pro['discount'])
                so_record_obj.unit_price = float(pro['unit_price'])
                if line_type == 'order':
                    so_record_obj.Taxes_id = int(pro['tax']) if 'tax' in pro and pro['tax'] != '' else None
                    so_record_obj.tax_price = float(pro['tax_amt'])
                    so_record_obj.price_subtotal = float(pro['subtotal'])
                    so_record_obj.price_total = float(pro['subtotal']) + float(pro['tax_amt'])
                so_record_obj.line_type = line_type
                so_record_obj.status = 'customer_invoice'
                so_record_obj.invoice_status = 'no'
                so_record_obj.save()


def invoice_by_percentage(percentage, quotation_id, invoice_obj):
    invoice_subtotal_amount = decimal.Decimal(0.00)
    invoice_tax_amount = decimal.Decimal(0.00)
    product_tax_amt = decimal.Decimal(0.00)
    new_sales_order = []
    sales_order_recode_dic = {}
    sales_order = Sale_order_record.objects.filter(order=quotation_id, line_type='order')
    if len(sales_order) > 0:
        for order in sales_order:
            price_total = (order.price_subtotal * decimal.Decimal(percentage) / 100)
            invoice_subtotal_amount = invoice_subtotal_amount + price_total
            if price_total and order.Taxes:
                product_tax_amt = (price_total * decimal.Decimal(order.Taxes.value) / 100)
                invoice_tax_amount = invoice_tax_amount + product_tax_amt
            sales_order_recode_dic[order.Product_id] = {'unit_price': order.unit_price, 'price_total': price_total,
                                                        'product_tax_amt': product_tax_amt}
            new_sales_order.append(sales_order_recode_dic)
        invoice_obj.total_amount = invoice_subtotal_amount + invoice_tax_amount
        invoice_obj.amount_due = invoice_subtotal_amount + invoice_tax_amount
        invoice_obj.subtotal_amount = invoice_subtotal_amount
        invoice_obj.tax_amount = invoice_tax_amount
        invoice_obj.invoice_creation_type = 'percentage'
        invoice_obj.save()
        if invoice_obj.id:
            for order_new in sales_order:
                so_record_obj1 = Sale_order_record()
                so_record_obj1.invoice = invoice_obj
                so_record_obj1.discription = 'Down payment of ' + str(percentage) + '%'
                so_record_obj1.customer = order_new.customer
                so_record_obj1.Product_id = order_new.Product_id
                so_record_obj1.Taxes_id = order_new.Taxes_id
                so_record_obj1.company = order_new.company
                so_record_obj1.create_by_user = order_new.create_by_user
                so_record_obj1.product_qty = order_new.product_qty
                so_record_obj1.unit_price = float(order_new.unit_price)
                so_record_obj1.tax_price = float(
                    round(sales_order_recode_dic[order_new.Product_id]['product_tax_amt'], 2))
                so_record_obj1.price_subtotal = float(
                    round(sales_order_recode_dic[order_new.Product_id]['price_total'], 2))
                so_record_obj1.price_total = float(
                    round(sales_order_recode_dic[order_new.Product_id]['price_total'], 2))
                so_record_obj1.status = 'customer_invoice'
                so_record_obj1.invoice_status = 'no'
                so_record_obj1.invoice_id = invoice_obj.id
                so_record_obj1.order_id = int(quotation_id)
                so_record_obj1.save()
        return True
    else:
        return False


def invoice_by_fixed_amount(fixed_amount, quotation_id, invoice_obj, currency='$'):
    sales_order = Sale_order_record.objects.filter(order=quotation_id, invoice_id=None).aggregate(
        price_subtotal=Sum('price_subtotal'))
    print("suyash test", fixed_amount, sales_order['price_subtotal'])
    try:
        percentage = decimal.Decimal(fixed_amount) * 100 / decimal.Decimal(sales_order['price_subtotal'])
    except ZeroDivisionError:
        print("next_crm::ZeroDivisionError")
        percentage = 0
    invoice_subtotal_amount = decimal.Decimal(0.00)
    invoice_tax_amount = decimal.Decimal(0.00)
    product_tax_amt = decimal.Decimal(0.00)
    new_sales_order = []
    sales_order_recode_dic = {}
    sales_order = Sale_order_record.objects.filter(order=quotation_id, line_type='order')
    if len(sales_order) > 0:
        for order in sales_order:
            price_total = (order.price_subtotal * decimal.Decimal(percentage) / 100)
            invoice_subtotal_amount = decimal.Decimal(invoice_subtotal_amount) + price_total
            print("temp", price_total, order.Taxes)
            if price_total and order.Taxes:
                product_tax_amt = (price_total * decimal.Decimal(order.Taxes.value) / 100)
            invoice_tax_amount = invoice_tax_amount + product_tax_amt
            sales_order_recode_dic[order.Product_id] = {'unit_price': order.unit_price, 'price_total': price_total,
                                                        'product_tax_amt': product_tax_amt}
            new_sales_order.append(sales_order_recode_dic)
        invoice_obj.total_amount = invoice_subtotal_amount + invoice_tax_amount
        invoice_obj.amount_due = invoice_subtotal_amount + invoice_tax_amount
        invoice_obj.subtotal_amount = invoice_subtotal_amount
        invoice_obj.tax_amount = invoice_tax_amount
        invoice_obj.invoice_creation_type = 'fixed'
        invoice_obj.save()
        if invoice_obj.id:
            for order_new in sales_order:
                so_record_obj1 = Sale_order_record()
                so_record_obj1.invoice = invoice_obj
                so_record_obj1.discription = 'Down payment of ' + str(fixed_amount) + ' ' + currency
                so_record_obj1.customer = order_new.customer
                so_record_obj1.Product_id = order_new.Product_id
                so_record_obj1.Taxes_id = order_new.Taxes_id
                so_record_obj1.company = order_new.company
                so_record_obj1.create_by_user = order_new.create_by_user
                so_record_obj1.product_qty = order_new.product_qty
                so_record_obj1.unit_price = float(order_new.unit_price)
                so_record_obj1.tax_price = float(
                    round(sales_order_recode_dic[order_new.Product_id]['product_tax_amt'], 2))
                so_record_obj1.price_subtotal = float(
                    round(sales_order_recode_dic[order_new.Product_id]['price_total'], 2))
                so_record_obj1.price_total = float(
                    round(sales_order_recode_dic[order_new.Product_id]['price_total'], 2))
                so_record_obj1.status = 'customer_invoice'
                so_record_obj1.invoice_status = 'no'
                so_record_obj1.invoice_id = invoice_obj.id
                so_record_obj1.order_id = int(quotation_id)
                so_record_obj1.save()
        return True

    else:
        return False


def invoice_by_balance(quotation_id, invoice_obj):
    utils = Utils()
    actual_total_amount = decimal.Decimal(0.00)
    total_invoiced_amount = decimal.Decimal(0.00)
    invoice_tax_amount = decimal.Decimal(0.00)
    balance_total_amount = decimal.Decimal(0.00)
    tax_amt = decimal.Decimal(0.00)
    percentage = decimal.Decimal(0.00)
    sales_order_recode_dic = {}
    sales_order = Sale_order_record.objects.filter(order=quotation_id)
    quotation_sales_order = []
    for sale_order in sales_order:
        if sale_order.status == 'Quotation':
            quotation_sales_order.append(sale_order)
            actual_total_amount = decimal.Decimal(actual_total_amount) + decimal.Decimal(
                round(sale_order.price_subtotal, 2))
        else:
            total_invoiced_amount = decimal.Decimal(total_invoiced_amount) + decimal.Decimal(
                round(sale_order.price_subtotal, 2))
    balance_total_amount = decimal.Decimal((actual_total_amount - total_invoiced_amount))
    try:
        if balance_total_amount and actual_total_amount:
            percentage = decimal.Decimal(round((balance_total_amount / actual_total_amount) * 100, 2))
    except ZeroDivisionError:
        print("next_crm::ZeroDivisionError")


    if len(quotation_sales_order) > 0:
        for order_new in quotation_sales_order:
            if order_new.price_subtotal and percentage and order_new.Taxes:
                # tax_amt = (order_new.price_subtotal * percentage / 100) * (float(order_new.Taxes.value) / 100)
                print("type", type(decimal.Decimal((order_new.price_subtotal * percentage / 100))),
                      type(order_new.Taxes.value))
                tax_amt = decimal.Decimal((order_new.price_subtotal * percentage / 100)) * (order_new.Taxes.value / 100)
            sales_order_recode_dic[order_new.Product_id] = {'product_tax_amt': tax_amt}
            invoice_tax_amount = invoice_tax_amount + tax_amt
        invoice_obj.total_amount = balance_total_amount + invoice_tax_amount
        invoice_obj.amount_due = balance_total_amount + invoice_tax_amount
        invoice_obj.subtotal_amount = balance_total_amount
        invoice_obj.tax_amount = invoice_tax_amount
        invoice_obj.invoice_creation_type = 'balance'
        invoice_obj.save()
        for order_new in quotation_sales_order:
            so_record_obj1 = Sale_order_record()
            so_record_obj1.invoice = invoice_obj
            so_record_obj1.discription = 'Balance '
            so_record_obj1.customer = order_new.customer
            so_record_obj1.Product_id = order_new.Product_id
            so_record_obj1.Taxes_id = order_new.Taxes_id
            so_record_obj1.company = order_new.company
            so_record_obj1.create_by_user = order_new.create_by_user
            so_record_obj1.product_qty = order_new.product_qty
            so_record_obj1.unit_price = float(order_new.unit_price)
            so_record_obj1.tax_price = float(round(sales_order_recode_dic[order_new.Product_id]['product_tax_amt'], 2))
            so_record_obj1.price_subtotal = float(round(order_new.price_subtotal, 2))
            so_record_obj1.price_total = float(round(order_new.price_total, 2))
            so_record_obj1.status = 'customer_invoice'
            so_record_obj1.invoice_status = 'no'
            so_record_obj1.invoice_id = invoice_obj.id
            so_record_obj1.order_id = int(quotation_id)
            so_record_obj1.save()
        customer_invoices = Customer_invoice.objects.select_related().filter(quotation_id=quotation_id).exclude(
            invoice_creation_type='balance')
        print("Total Invoices are ", len(customer_invoices), customer_invoices.query)
        if customer_invoices:
            for customer_invoice in customer_invoices:
                sales_order_down_payment = Sale_order_record()
                sales_order_down_payment.invoice = invoice_obj
                sales_order_down_payment.discription = 'Advance of ' + str(
                    customer_invoice.created_at.strftime("%d-%m-%Y"))
                sales_order_down_payment.customer = customer_invoice.customer_id
                sales_order_down_payment.company = customer_invoice.company
                sales_order_down_payment.create_by_user_id = customer_invoice.create_by_user_id
                sales_order_down_payment.product_qty = -1
                sales_order_down_payment.unit_price = 0
                sales_order_down_payment.price_subtotal = float(round(customer_invoice.subtotal_amount, 2) * -1)
                sales_order_down_payment.price_total = float(round(customer_invoice.subtotal_amount, 2) * -1)
                sales_order_down_payment.status = 'customer_invoice'
                sales_order_down_payment.invoice_status = 'no'
                sales_order_down_payment.invoice_id = invoice_obj.id
                sales_order_down_payment.order_id = int(quotation_id)
                sales_order_down_payment.save()
        return True
    else:
        return False


def CreateInvoice(request):
    data = {'success': False, 'msg': None}
    company_id = request.user.profile.company_id
    currency = get_currency_name(company_id)
    user_obj = request.user
    user_id = user_obj.id
    json_data = json.loads(request.POST['fields'])
    print("json_data", json_data['quotation_id'])
    try:
        res = Sale_order.objects.get(uuid=json_data['quotation_id'], company_id=company_id)
        if res:
            quotation_id = res.id
            invoice_obj = Customer_invoice()
            invoice_obj.customer_id = res.customer_id
            invoice_obj.customer_name = res.customer_name
            invoice_obj.quotation_name = res.name
            invoice_obj.status = 'draft'
            invoice_obj.invoice_status = json_data['radio_type']
            invoice_obj.quotation_id = quotation_id
            invoice_obj.company_id = company_id
            invoice_obj.sales_person = user_id
            invoice_obj.create_by_user_id = user_id
            invoice_obj.payment_term_id = res.payment_term_id
            if json_data['invoice_type'] == 'manual' and json_data['radio_type'] == 'percentage' and json_data['percentage_value'] != '':
                invoice_by_percentage(json_data['percentage_value'], quotation_id, invoice_obj)
                data['success'] = True
            elif json_data['invoice_type'] == 'manual' and  json_data['radio_type'] == 'fixed' and json_data['fixed_amount'] != '':
                invoice_by_fixed_amount(json_data['fixed_amount'], quotation_id, invoice_obj, currency=currency)
                data['success'] = True
            elif json_data['invoice_type'] == 'manual' and  json_data['radio_type'] == 'balance':
                invoice_by_balance(quotation_id, invoice_obj)
                data['success'] = True
            else:
                # To do ask with joris and if same balance
                tax_amount = 0
                if res.tax_amount:
                    Customer_tax_list = Customer_invoice.objects.filter(quotation_id=quotation_id)
                    for Customer_tax in Customer_tax_list:
                        if Customer_tax.tax_amount != '' and Customer_tax.tax_amount is not None:
                            tax_amount = tax_amount + float(Customer_tax.tax_amount)
                    invoice_obj.tax_amount = float(res.tax_amount) - (tax_amount)
                else:
                    invoice_obj.tax_amount = float(0)
                invoice_obj.total_amount = float(res.amount_untaxed) + float(invoice_obj.tax_amount)
                invoice_obj.amount_due = float(res.amount_untaxed) + float(invoice_obj.tax_amount)
                invoice_obj.subtotal_amount = float(res.amount_untaxed)
                invoice_obj.save()
                so_id = invoice_obj.id
                if json_data['radio_type'] == 'delivered':
                    Sale_order_record11 = Sale_order_record.objects.filter(order=quotation_id, line_type='order').update(invoice=so_id)
                data['success'] = True
    except Sale_order.DoesNotExist:
        data['msg'] = 'sales order does not exits.'
        pass

    print("response", data)
    return HttpResponse(json.dumps(data), content_type='application/json')





def last_day_of_month(year, month):
    """ Work out the last day of the month """
    last_days = [31, 30, 29, 28, 27]
    for innn in last_days:
        try:
            end = datetime.date(year, month, innn)
        except ValueError:
            continue
        else:
            return end
    return None



def AutoCreateInvoice(request):
    data = {'success':False,'msg':None}
    company_id = request.user.profile.company_id
    currency = get_currency_name(company_id)
    user_obj = request.user
    user_id = user_obj.id
    pt_list = []
    json_data = json.loads(request.POST['fields'])
    print("json_data::", json_data['send_by_email'])
    mainvaluereturn = 0
    mainvaluereturnp = 0
    temp_total = 0.0
    fields = formatFields(json_data)
    try:
        res = Sale_order.objects.get(uuid=json_data['quotation_id'], company_id=company_id)
        quotation_id = res.id
        subtotal = res.total_amount
        if res:
            if res.payment_term_id:
                pay_obj = Term.objects.filter(payment_term_id=res.payment_term_id).order_by('-value')
                if len(pay_obj) > 0:
                    for pay_objs in pay_obj:
                        pt_list.append({
                            'due_type': pay_objs.due_type,
                            'value': pay_objs.value,
                            'number_days': pay_objs.number_days,
                            'days': pay_objs.days
                        })
                        TODAY = date.today()
                        number_days = pay_objs.number_days if pay_objs.number_days != '' else 0
                        now = datetime.datetime.now()
                        nowyear = now.year
                        nowmonth = now.month
                        followingmonth = now.month + 1
                        if pay_objs.days == 'invoice':
                            mon_rel = relativedelta(days=int(number_days))
                            due_date = TODAY + mon_rel
                        elif pay_objs.days == 'end_invoice':
                            last = last_day_of_month(nowyear, nowmonth)
                            mon_rel = relativedelta(days=int(number_days))
                            due_date = last + mon_rel
                        elif pay_objs.days == 'following_month':
                            last = last_day_of_month(nowyear, followingmonth)
                            due_date = last
                        elif pay_objs.days == 'current_month':
                            last = last_day_of_month(nowyear, nowmonth)
                            due_date = last
                        if pay_objs.due_type == 'fixed_amount':
                            if mainvaluereturn == 0:
                                mainvaluefixed_amount = float(pay_objs.value)
                            else:
                                mainvaluefixed_amount = float(pay_objs.value) + float(mainvaluereturn)
                            value = pay_objs.value
                            mainvalue = float(value)
                            mainvalue1 = float(subtotal) - float(value)
                            mainvaluereturn = mainvaluefixed_amount

                            temp_total = temp_total + float(pay_objs.value)
                        elif pay_objs.due_type == 'percent':
                            Percentage = pay_objs.value
                            value = float(subtotal) * float(Percentage) / 100
                            if mainvaluereturnp == 0:
                                mainvaluepercentage = float(value)
                            else:
                                mainvaluepercentage = float(value) + float(mainvaluereturnp)
                            mainvalue3 = float(subtotal) - float(value)
                            mainvalue1 = float(mainvalue3)
                            mainvalue = float(value)
                            mainvaluereturnp = mainvaluepercentage

                            temp_total = temp_total + (float(subtotal) * (float(Percentage) / 100))
                        else:
                            if pay_objs.due_type == 'balance':
                                mainvalue = float(subtotal) - float(temp_total)

                        invoice_obj = Customer_invoice()
                        if json_data['send_by_email'] and json_data['email_template_id']:
                            invoice_obj.email_template = json_data['email_template_id']
                        if json_data['send_by_email']:
                            invoice_obj.checkbox_email = json_data['send_by_email']
                        invoice_obj.customer_id = res.customer_id
                        invoice_obj.customer_name = res.customer_name
                        invoice_obj.quotation_name = res.name
                        invoice_obj.status = 'draft'
                        invoice_obj.invoice_status = 'email'
                        invoice_obj.due_date = due_date
                        invoice_obj.quotation_id = quotation_id
                        invoice_obj.company_id = company_id
                        invoice_obj.create_by_user_id = user_id
                        invoice_obj.payment_term_id = res.payment_term_id
                        invoice_obj.total_amount = float(mainvalue)
                        invoice_obj.amount_due = float(mainvalue)
                        invoice_obj.subtotal_amount = float(mainvalue)
                        invoice_obj.term_id = pay_objs.id
                        invoice_obj.save()
                        if pay_objs.due_type == 'percent':
                            invoice_by_percentage(pay_objs.value, quotation_id, invoice_obj)
                            data['success'] = True
                        elif pay_objs.due_type == 'fixed_amount':
                            invoice_by_fixed_amount(pay_objs.value, quotation_id, invoice_obj, currency=currency)
                            data['success'] = True
                        elif pay_objs.due_type == 'balance':
                            invoice_by_balance(quotation_id, invoice_obj)
                            data['success'] = True
                        #data['msg'] = 'please select payment term first for auto option selection'
            else:
                data['success'] = False
                data['msg'] = 'please select payment term first for auto option selection'
    except Sale_order.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type='application/json')


def sendAutoInvoiceEmail(company_id, user_id, quotation_id, quotation_name, customer_id, customer_name):
    data = {}
    # data['success'] = False
    company_id = company_id
    user_id = user_id
    quotationID = quotation_id
    qname = quotation_name
    customer = customer_id
    customer_name = customer_name
    email_id = ''
    email_name = ''

    pdf_url = settings.HOST_NAME + "quotation/pdf_download/" + quotationID
    r = requests.get(pdf_url, stream=True)
    pdf_file_name = qname + '.pdf'
    pdf_file_path = settings.BASE_DIR + '/media/' + str(company_id) + '/' + pdf_file_name

    if not os.path.exists(os.path.dirname(pdf_file_path)):
        try:
            os.makedirs(os.path.dirname(pdf_file_path))
        except OSError as exc:  # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

    with open(pdf_file_path, 'wb') as fd:
        for chunk in r.iter_content(2000):
            fd.write(chunk)
    recipt_id_list = str(customer_id)
    From = 'crm@sitenco.com'
    msgdata = "helllooo how r you"
    subject = "Personal Data Refuded"

    text_content = "k"
    filename = "%s.pdf" % (qname + '_' + customer_name)

    if len(recipt_id_list) > 0:
        email_list = getCustomerAutoEmailAddr(recipt_id_list, user_id)
        for x in email_list:
            email_list = x['email_list']
            if email_list != '' and email_list != None:
                result = EmailMultiAlternatives(subject, text_content, From, [email_list])
                result.attach_alternative(msgdata, "text/html")
                result.attach_file(pdf_file_path)
                result.send()
                data['success'] = True
            else:
                data['success'] = True

        data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def getCustomerAutoEmailAddr(id_list, user_id):
    email_list = []
    contact_field_valuet = ContactFieldsValue.objects.select_related('contact', 'contact_field').all()
    contact_field_value = contact_field_valuet.filter(user_id=user_id).filter(contact_id=id_list)
    for ct in contact_field_value:
        if ct.contact_field.name == "email" and ct.contact_field.is_default:
            email_list.append({'email_list': ct.contact_field_value})
    return email_list


def saveProduct(company_id, user_id, user_obj):
    product_tmpl_obj = Product_template();
    product_tmpl_obj.name = 'Down Payment'
    product_tmpl_obj.can_be_sold = True
    product_tmpl_obj.can_be_purchased = True
    product_tmpl_obj.description = 'Down Payment'
    product_tmpl_obj.create_by_user = user_obj
    product_tmpl_obj.company = company_id
    product_tmpl_obj.save()
    if product_tmpl_obj.id > 0:
        product_obj = Product();
        product_obj.product_tmpl = product_tmpl_obj
        product_obj.status = 'down_payment'
        product_obj.template_name = 'Down Payment'
        product_obj.create_by_user = user_obj
        product_obj.company = company_id
        product_obj.save()

        if product_obj.id > 0:
            cost_obj = Product_cost_history()
            cost_obj.product = product_tmpl_obj
            cost_obj.cost = 0
            cost_obj.company = company_id
            cost_obj.save()

    return product_obj.id


@login_required(login_url="/login/")
def editdata(request, edit_id):
    utils = Utils()
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    maxnum = []
    currency = get_currency_name(company_id)
    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    is_editable = True
    invoice_data = Customer_invoice.objects.get(encrypt_id=edit_id)
    if 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_MANAGE_ALL_QUOTATION' in roles or request.user.id == invoice_data.created_by_user_id:
        is_editable = True
        if invoice_data.status == 'open' or invoice_data.status == 'paid':
            is_editable = False

    invoice_date = None
    due_date = None
    if invoice_data.invoice_date is not None:
        invoice_date = invoice_data.invoice_date.strftime('%Y-%m-%d')
    if invoice_data.due_date is not None:
        due_date = invoice_data.due_date.strftime('%Y-%m-%d')
    payment_term_days = ''
    invoice_Taxes_name = ''
    if invoice_data.quotation_id is not None and invoice_data.quotation_id != '':
        quot_obj = Sale_order.objects.get(pk=invoice_data.quotation_id)
        payment_term_id = quot_obj.payment_term_id
        if payment_term_id is not None and payment_term_id != '':
            pay_obj = Term.objects.filter(payment_term=payment_term_id)
            if len(pay_obj) > 0:
                for pay_objs in pay_obj:
                    maxnum.append(pay_objs.number_days)
                    payment_term_days = max(maxnum)
            else:
                payment_term_days = None

        if invoice_data.Taxes is not None and invoice_data.Taxes != '':
            invoice_Taxes_name = invoice_data.Taxes.name
        else:
            invoice_Taxes_name = None

    payment_term_id = ''
    pay_tm_name = ''
    invoice_notes = ''
    if invoice_data.payment_term is not None:
        payment_term_id = invoice_data.payment_term_id
        pay_tm_name = invoice_data.payment_term.name

    order_date1 = ''

    if invoice_data.name != "" and invoice_data.name is not None:
        invoice_name = invoice_data.name
    else:
        invoice_name = None

    if invoice_data.quotation_id != "" and invoice_data.quotation_id is not None:
        invoice_quotation_id = invoice_data.quotation_id
    else:
        invoice_quotation_id = None

    if invoice_data.quotation_name != "" and invoice_data.quotation_name is not None:
        invoice_quotation_name = invoice_data.quotation_name
    else:
        invoice_quotation_name = None
    if invoice_data.notes:
        invoice_notes = invoice_data.notes
    else:
        invoice_notes = request.user.company.invoice_term_and_condition

    Invoicing_data = {'id': invoice_data.id,
                      'uuid': str(invoice_data.encrypt_id),
                      'name': invoice_name,
                      'customer_name': invoice_data.customer_name,
                      'customer_id': invoice_data.customer_id,
                      'invoice_date': invoice_date,
                      'due_date': due_date,
                      'currency': currency,
                      'payment_term': payment_term_id,
                      'pay_tm_name': pay_tm_name,
                      'payment_term_days': payment_term_days,
                      'sales_person': invoice_data.sales_person,
                      'quotation_id': invoice_quotation_id,
                      'quotation_name': invoice_quotation_name,
                      'invoice_status': invoice_data.invoice_status,
                      'status': invoice_data.status,
                      'total_amount': utils.round_value(invoice_data.total_amount),
                      'subtotal_amount': utils.round_value(invoice_data.subtotal_amount),
                      'amount_due': utils.round_value(invoice_data.amount_due),
                      'tax_amount': utils.round_value(invoice_data.tax_amount),
                      'Taxes': invoice_Taxes_name,
                      'notes': invoice_notes,
                      'is_editable': is_editable
                      }

    Invoicing_data['products'] = getQuotationProduct(invoice_data.id, 'order', company_id, user_id, roles)

    display_tax_return_data = display_tax_calculation(Invoicing_data['products'])

    Invoicing_data['tax_amount'] = display_tax_return_data['total_tax']
    Invoicing_data['payment'] = getPaymentRegister(invoice_data.id)

    if Invoicing_data is not None:
        data['Invoicing'] = Invoicing_data
        data['Invoicing']['multiple_tax'] = display_tax_return_data['multiple_tax_list']
        data['user_id'] = user_id
        data['success'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")


def display_tax_calculation(product_data):
    utils = Utils()
    return_data = {'multiple_tax_list': [], 'total_tax': ''}
    multiple_tax_list = []
    total_tax = 0.00
    dics = {}
    if len(product_data) > 0:
        for product in product_data:
            if product['product_tax_name']:
                if product['product_tax_name'] in dics.keys():
                    dics[product['product_tax_name']] = float(product['tax_price']) + float(
                        dics[product['product_tax_name']])
                else:
                    dics[product['product_tax_name']] = float(product['tax_price'])
        for key, value in dics.items():
            total_tax = utils.round_value(total_tax) + utils.round_value(value)
            multiple_tax_list.append({'tax_name': key, 'tax_amount': utils.round_value(value)})
        return_data['multiple_tax_list'] = multiple_tax_list
        return_data['total_tax'] = total_tax
    return return_data


@login_required(login_url="/login/")
def updateInvoice(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    json_data = json.loads(request.POST['fields'])
    if 'id' in json_data and json_data['id']:
        try:
            if json_data['status_invoice'] != 'draft':
                cinvoice_obj = Customer_invoice.objects.get(encrypt_id=json_data['id'])
                cinvoice_obj.update_by_user = user_obj
                if 'customer_id' in json_data and json_data['customer_id'] != '' and int(json_data['customer_id']) > 0:
                    cinvoice_obj.customer_id = int(json_data['customer_id'])
                else:
                    cinvoice_obj.customer_id = None
                if 'customer_name' in json_data and json_data['customer_name'] != '':
                    cinvoice_obj.customer_name = json_data['customer_name']
                else:
                    cinvoice_obj.customer_name = None
                cinvoice_obj.save()
            else:
                cinvoice_obj = Customer_invoice.objects.get(encrypt_id=json_data['id'])
                cinvoice_obj.update_by_user = user_obj
                if 'customer_id' in json_data and json_data['customer_id'] != '' and int(json_data['customer_id']) > 0:
                    cinvoice_obj.customer_id = int(json_data['customer_id'])
                else:
                    cinvoice_obj.customer_id = None
                if 'customer_name' in json_data and json_data['customer_name'] != '':
                    cinvoice_obj.customer_name = json_data['customer_name']
                else:
                    cinvoice_obj.customer_name = None
                if 'payment_term' in json_data and json_data['payment_term'] != '':
                    cinvoice_obj.payment_term_id = int(json_data['payment_term'])
                else:
                    cinvoice_obj.payment_term_id = None
                if 'tax_amt' in json_data and json_data['tax_amt'] != '' and json_data['tax_amt'] is not None:
                    cinvoice_obj.tax_amount = float(json_data['tax_amt'])
                else:
                    cinvoice_obj.tax_amount = 0.00
                if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
                    cinvoice_obj.subtotal_amount = float(json_data['untaxed_amt'])
                    if 'tax_amt' in json_data and json_data['tax_amt'] != '':
                        cinvoice_obj.total_amount = float(json_data['untaxed_amt']) + float(cinvoice_obj.tax_amount)
                        cinvoice_obj.amount_due = float(json_data['untaxed_amt']) + float(cinvoice_obj.tax_amount)
                    else:
                        cinvoice_obj.total_amount = float(json_data['untaxed_amt'])
                        cinvoice_obj.amount_due = float(json_data['untaxed_amt'])
                else:
                    cinvoice_obj.subtotal_amount = 0.00
                if 'due_date' in json_data and json_data['due_date'] != '':
                    cinvoice_obj.due_date = datetime.datetime.strptime(json_data['due_date'], "%m/%d/%Y")
                else:
                    cinvoice_obj.due_date = None
                if 'invoice_date' in json_data and json_data['invoice_date'] != '':
                    cinvoice_obj.invoice_date = datetime.datetime.strptime(json_data['invoice_date'], "%m/%d/%Y")
                else:
                    cinvoice_obj.invoice_date = datetime.date.today()
                if 'notes' in json_data:
                    cinvoice_obj.notes = json_data['notes']
                else:
                    cinvoice_obj.notes = None

                cinvoice_obj.save()

                so_id = cinvoice_obj.id
                customer_id = cinvoice_obj.customer_id
                Sale_order_record.objects.filter(invoice=cinvoice_obj).delete()
                if so_id > 0:
                    addProduct(json_data['products'], 'order', cinvoice_obj, user_obj, company_id, customer_id)
                    contact_change_status(customer_id, 'customer')
                data['id'] = so_id
            data['success'] = True
            data['encrypt_id'] = str(cinvoice_obj.encrypt_id)

        except Sale_order.DoesNotExist:
            data['success'] = False

    return HttpResponse(json.dumps(data), content_type='application/json')


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        if "value" in json_obj:
            fields[json_obj["name"]] = json_obj["value"]
    return fields


def deletecustomer(request):
    data = {}
    data['success'] = False
    id_list = json.loads(request.POST['ids'])
    if len(id_list) > 0:
        for i in id_list:
            try:
                quot_obj = Customer_invoice.objects.get(pk=int(i)).delete()
            except quot_obj.DoesNotExist:
                pass
        data['success'] = True
    return HttpResponse(json.dumps(data), content_type='application/json')

def Checksendmail(request):
    data = {}
    data['success'] = False
    id_list = json.loads(request.POST['ids'])
    quot_obj = Customer_invoice.objects.filter(pk=int(id_list)).update(checkbox_email=False)
    data['success'] = True
    return HttpResponse(json.dumps(data), content_type='application/json')

def CancelChecksendmail(request):
    data = {}
    data['success'] = False
    id_list = json.loads(request.POST['ids'])
    if len(id_list) > 0:
        for i in id_list:
            quot_obj = Customer_invoice.objects.filter(pk=int(i)).update(checkbox_email=False)
            data['success'] = True
    return HttpResponse(json.dumps(data), content_type='application/json')


def RegistrationPayment(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    json_data = json.loads(request.POST['fields'])
    #print(json_data)
    try:
        cust_obj = Customer_invoice.objects.get(encrypt_id=json_data['invoice_id'])
        qout_obj = Payment_register();
        qout_obj.customer_invoice_id = cust_obj.id
        qout_obj.reason = json_data['reason']
        qout_obj.company_id = company_id
        qout_obj.customer_id = cust_obj.customer_id
        qout_obj.customer_name = cust_obj.customer_name
        print("date::", type(json_data['payment_date']))
        payment_date = datetime.datetime.strptime(json_data['payment_date'], "%Y-%m-%d")
        print("date after ::", payment_date)

        if json_data['fully_paid'] and not json_data['keep_open']:
            qout_obj.payment_date = payment_date
            qout_obj.payment_difference = 0
            qout_obj.total_payment_amount = json_data['payment_amount']
            qout_obj.payment_amount = json_data['total_amount']
            qout_obj.payment_journal = json_data['payment_journal']
            qout_obj.payment_memo = json_data['memo']
            cust_obj.amount_due = 0
            qout_obj.status = 'POSTED'
            qout_obj.payment_method_type = 'Manual'
            cust_obj.status = 'paid'
            qout_obj.save()
            cust_obj.save()

        elif json_data['keep_open'] and not json_data['fully_paid']:
            payment_difference = float(json_data['payment_difference'])
            if payment_difference > 0:
                print("i am in payment diff")
                qout_obj.payment_amount = json_data['payment_amount']
                qout_obj.total_payment_amount = json_data['payment_amount']
                qout_obj.payment_difference = 0
                cust_obj.amount_due = payment_difference
                cust_obj.status = 'open'
            else:
                qout_obj.payment_amount = json_data['total_amount']
                qout_obj.total_payment_amount = json_data['payment_amount']
                qout_obj.payment_difference = abs(payment_difference)
                cust_obj.amount_due = 0
                cust_obj.status = 'paid'

            qout_obj.status = 'POSTED'
            qout_obj.payment_method_type = 'Manual'
            qout_obj.payment_date = payment_date
            qout_obj.payment_journal = json_data['payment_journal']
            qout_obj.payment_memo = json_data['memo']
            qout_obj.save()
            cust_obj.save()
        '''else:
            qout_obj.payment_date = datetime.datetime.strptime(fields['payment_date'], "%m/%d/%Y")
            qout_obj.payment_difference = 0
            qout_obj.payment_amount = fields['total_amount']
            qout_obj.total_payment_amount = fields['payment_amount']
            qout_obj.payment_journal = fields['payment_journal']
            qout_obj.payment_memo = fields['memo']
            qout_obj.customer_invoice_id = fields['cinvoice_id']
            cust_obj.amount_due = 0
            cust_obj.status = 'paid'
            qout_obj.status = 'POSTED'
            qout_obj.payment_method_type = 'Manual'
            qout_obj.customer_id = int(fields['customer_id'])
            qout_obj.customer_name = fields['customer_name']
            qout_obj.save()
            cust_obj.save()'''


        qout_obj.create_by_user_id = user_obj

        so_id = qout_obj.id
        name = 'CUST.IN/'
        now = datetime.datetime.now()
        year = now.year
        name = name + str(year)

        if len(str(so_id)) == 1:
            name = name + '/' + '000' + str(so_id)
        elif len(str(so_id)) == 2:
            name = name + '/' + '00' + str(so_id)
        elif len(str(so_id)) == 3:
            name = name + '/' + '0' + str(so_id)
        elif len(str(so_id)) > 3:
            name = name + '/' + str(so_id)

        qout_obj.name = name
        qout_obj.save()

        pay_obj = Payment_register_record();
        if so_id > 0:
            pay_obj.payment_date = payment_date
            pay_obj.payment_amount = qout_obj.payment_amount
            pay_obj.total_payment_amount = qout_obj.total_payment_amount
            pay_obj.payment_register_id = so_id
            pay_obj.payment_journal = qout_obj.payment_journal
            pay_obj.payment_memo = qout_obj.payment_memo
            pay_obj.customer_invoice_id = qout_obj.customer_invoice_id
            pay_obj.save()

        data['status'] = cust_obj.status
        data['success'] = True
    
    except Customer_invoice.DoesNotExist:
        data['success'] = True
    return HttpResponse(json.dumps(data), content_type='application/json')

def getUomlist(company_id, user_id, roles):
    uom_list = []
    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        uom_objs = Product_unit_of_measure.objects.filter(company=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        uom_objs = Product_unit_of_measure.objects.filter(create_by_id=user_id)

    if len(uom_objs) > 0:
        for uom in uom_objs:
            uom_list.append({'id': uom.id,
                             'name': uom.name
                             })

    return uom_list
def getTaxesById(tax_id):
    data = {}
    data['success'] = False
    pro_tax_list = {}
    pro_tax = Product_taxes.objects.get(pk=tax_id)
    pro_tax_list['id'] = int(pro_tax.id)
    pro_tax_list['name'] = pro_tax.name
    pro_tax_list['value'] = pro_tax.value
    pro_tax_list['computation'] = pro_tax.computation

    return pro_tax_list


def invoiceexport(request):
    export_status = {'success': False}
    user_obj = request.user

    id_list = json.loads(request.POST['ids'])
    list_dic = []
    data = []
    if len(id_list) > 0:
        for i in id_list:
            quot_obj = Customer_invoice.objects.filter(pk=int(i))
            for o in quot_obj:

                if o.name is not None and o.name != '':

                    name = o.name
                else:
                    name = ''

                if o.customer_name is not None and o.customer_name != '':

                    customer_name = o.customer_name
                else:
                    customer_name = ''

                if o.invoice_date is not None and o.invoice_date != '':

                    invoice_date = datetime.datetime.strptime(str(o.invoice_date), "%Y-%m-%d").strftime("%d/%m/%Y")
                else:
                    invoice_date = ' '

                if o.due_date is not None and o.due_date != '':
                    due_date = datetime.datetime.strptime(str(o.due_date), "%Y-%m-%d").strftime("%d/%m/%Y")
                else:
                    due_date = ' '

                if o.quotation_name is not None and o.quotation_name != '':
                    quotation_name = o.quotation_name
                else:
                    quotation_name = ' '

                if o.total_amount is not None and o.total_amount != '':
                    total_amount = str(o.total_amount)
                else:
                    total_amount = ' '

                if o.amount_due is not None and o.amount_due != '':
                    amount_due = str(o.amount_due)
                else:
                    amount_due = ''

                if o.status is not None and o.status != '':
                    status = o.status
                else:
                    status = ''

                list_dic.append({
                    'Customer Name': customer_name,
                    'Invoice Date': invoice_date,
                    'Invoice Number': name,
                    'Sales Person': user_obj.username,
                    'Due Date': due_date,
                    'Source Document': quotation_name,
                    'Total': total_amount,
                    'Amount Due': amount_due,
                    'Status': status,

                })

    if list_dic:
        to_csv = list_dic
        keys1 = (to_csv[0].keys())
        keys = (
        ['Customer Name', 'Invoice Date', 'Invoice Number', 'Sales Person', 'Due Date', 'Source Document', 'Total',
         'Amount Due', 'Status'])

        file_path = 'media/user_csv/' + str(request.user.id)
        file_name = time.strftime("%Y%m%d-%H%M%S") + '.csv'
        if not os.path.exists(file_path):
            os.makedirs(file_path)
        uploaded_file_url = file_path + '/' + file_name
        with open(uploaded_file_url, 'w', encoding="latin-1", newline='') as fp:
            dict_writer = csv.DictWriter(fp, keys)
            dict_writer.writeheader()
            for dic in list_dic:
                keys, values = zip(*dic.items())
                dict_writer.writerow(dict(zip(keys, values)))

        export_status = {'success': True, 'file': uploaded_file_url}

    return HttpResponse(json.dumps(export_status), content_type="application/json")


def imports(request):
    if len(request.FILES) != 0:
        contact_list = {'success': False, 'file': ''}
        file_path = 'media/user_csv/' + str(request.user.id)

        user_company_id = request.user.profile.company_id
        fields = []
        product_fileds = Customer_invoice._meta.get_fields()
        for field in product_fileds:
            fields_dic = {'name': field.name}
            fields.append(fields_dic)

        contact_list['fields'] = [{'name': 'Invoice Number'}, {'name': 'Invoice Date'}, {'name': 'Due Date'},
                                  {'name': 'Customer Name'}, {'name': 'Status'}, {'name': 'Payment term'},
                                  {'name': 'Source Document'}]
        # contact_list['fields'] = fields
        if request.method == 'POST' and request.FILES['ufile']:
            if request.FILES['ufile'].name.split('.')[-1] == "csv":
                myfile = request.FILES['ufile']
                fs = FileSystemStorage(location='media/user_csv/' + str(request.user.id))
                filename = fs.save(myfile.name, myfile)
                uploaded_file_url = settings.BASE_DIR + '/' + file_path + '/' + filename
                file_rows = []
                temp_list_one = []
                temp_list_two = []
                temp_list_three = []
                temp_list_four = []
                temp_list_five = []
                header_list = []

                try:
                    with open(uploaded_file_url, "r", encoding="latin-1") as csvfile:
                        contact_list['file'] = filename
                        dialect = csv.Sniffer().sniff(csvfile.read(), delimiters=';,')
                        csvfile.seek(0)
                        reader = csv.reader(csvfile, dialect=dialect)
                        try:
                            for line_number, row in enumerate(reader):
                                if line_number < 6:
                                    for i in range(len(row)):
                                        if line_number == 0:
                                            header_list.append(row[i])
                                        if line_number == 1:
                                            temp_list_one.append(row[i])
                                        if line_number == 2:
                                            temp_list_two.append(row[i])
                                        if line_number == 3:
                                            temp_list_three.append(row[i])
                                        if line_number == 4:
                                            temp_list_four.append(row[i])
                                        if line_number == 5:
                                            temp_list_five.append(row[i])
                                else:
                                    break
                            for i in range(len(temp_list_one)):
                                file_rows.append(str(temp_list_one[i]) + "\n" + str(temp_list_two[i]) + "\n" + str(
                                    temp_list_three[i]) + "\n" + str(temp_list_four[i]) + "\n" + str(temp_list_five[i]))

                            contact_list['csv_cols'] = file_rows
                            contact_list['header'] = header_list
                            contact_list['success'] = True
                            contact_list['msg'] = 'processing'
                        except csv.Error as e:
                            sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
                except IOError as e:
                    print("I/O error({0}): {1}".format(e.errno, e.strerror))
            else:
                contact_list = {'success': False, 'file': '', 'msg': 'You did not selected csv file.'}
    else:
        contact_list = {'success': False, 'file': '', 'msg': 'You did not selected any file.'}
    return HttpResponse(json.dumps(contact_list), content_type="application/json")


def import_mapping(request):
    contact_list = {'success': False, 'file': ''}
    user_id = request.user.id
    company_id = request.user.profile.company_id
    user_obj = request.user
    utils = Utils()
    if request.method == "POST" and request.is_ajax():
        if 'file_name' in request.POST:
            file_name = request.POST['file_name']
            fields = json.loads(request.POST['fields'])
            if fields.count('0') == len(fields):
                contact_list = {'success': False, 'file': '', 'msg': 'You did not selected any fields.'}
                return HttpResponse(json.dumps(contact_list), content_type="application/json")
            file_path = 'media/user_csv/' + str(request.user.id)
            uploaded_file_url = settings.BASE_DIR + '/' + file_path + '/' + file_name
            try:
                with open(uploaded_file_url, "r", encoding="latin-1") as csvfile:
                    dialect = csv.Sniffer().sniff(csvfile.read(), delimiters=';,')
                    csvfile.seek(0)
                    reader = csv.reader(csvfile, dialect=dialect)
                    file_rows = []
                    try:
                        for line_number, row in enumerate(reader):
                            if (line_number) >= 1:
                                temp_dic = {}

                                for idx, col in enumerate(fields):

                                    temp_list = []
                                    if col != '0':
                                        if row[idx]:
                                            if fields[idx] in temp_dic:
                                                temp_list.append(utils.comma_sep_value(temp_dic[fields[idx]]))
                                                temp_list.append(row[idx])
                                                temp_dic[fields[idx]] = temp_list
                                            else:
                                                temp_dic[fields[idx]] = row[idx]

                                file_rows.append(temp_dic)
                        if len(file_rows) > 0:
                            format_and_save_product(company_id, user_obj, file_rows)
                        contact_list['csv_cols'] = file_rows
                        contact_list['success'] = True
                        contact_list['msg'] = 'Import is running, whenever, you can use the system'
                        os.remove(uploaded_file_url)
                    except csv.Error as e:
                        sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
            except IOError as e:
                print("I/O error({0}): {1}".format(e.errno, e.strerror))
    return HttpResponse(json.dumps(contact_list), content_type="application/json")


def format_and_save_product(company_id, user_obj, list_data):
    contact_data_list = []
    utils = Utils()
    for i, d in enumerate(list_data):
        fields_list = []
        contact_data = {'fields': []}

        fields_list.append(d)

        contact_data['fields'] = fields_list
        contact_data_list.append(contact_data)
        save_in_db(company_id, user_obj, contact_data)
    return True


def save_in_db(company_id, user_obj, contact_data):
    company_id = company_id
    user_obj = user_obj
    user_id = user_obj.id

    fields_data = {}
    fields_data['success'] = False
    fields = contact_data['fields']

    product_tmpl_obj = Customer_invoice()

    for fields_data in fields:

        if 'Invoice Number' in fields_data and fields_data['Invoice Number'] != '':

            product_tmpl_obj.name = fields_data['Invoice Number']

            TODAY = datetime.date.today()
            mon_rel = relativedelta(months=1)
            expiration_date_else = TODAY + mon_rel

            if 'Invoice Date' in fields_data and fields_data['Invoice Date'] != '':
                product_tmpl_obj.invoice_date = datetime.datetime.strptime(fields_data['Invoice Date'], "%d/%m/%Y")
            else:
                product_tmpl_obj.invoice_date = expiration_date_else

            if 'Due Date' in fields_data and fields_data['Due Date'] != '':
                product_tmpl_obj.due_date = datetime.datetime.strptime(fields_data['Due Date'], "%d/%m/%Y")
            else:
                product_tmpl_obj.due_date = datetime.date.today()

            if 'Status' in fields_data and fields_data['Status'] != '':
                product_tmpl_obj.status = fields_data['Status']

            if 'Source Document' in fields_data and fields_data['Source Document'] != '':
                product_tmpl_obj.quotation_name = fields_data['Source Document']

            if 'Customer Name' in fields_data and fields_data['Customer Name'] != '':
                try:
                    contactpt = Contact.objects.get(name=fields_data['Customer Name'])
                    product_tmpl_obj.customer_id = contactpt.id
                    product_tmpl_obj.customer_name = fields_data['Customer Name']
                except:
                    contactp = Contact()
                    contactp.name = fields_data['Customer Name']
                    contactp.contact_type = 'C'
                    contactp.is_vendor = False
                    contactp.is_customer = True
                    contactp.user_id = user_id
                    contactp.user_company_id = company_id
                    contactp.save()
                    product_tmpl_obj.customer_id = contactp.id
                    product_tmpl_obj.customer_name = fields_data['Customer Name']

            if 'Payment term' in fields_data and fields_data['Payment term'] != '':
                try:
                    payment = Payment_term.objects.get(name=fields_data['Payment term'])
                    product_tmpl_obj.payment_term_id = payment.id
                except:
                    paymenttp = Payment_term()
                    paymenttp.name = fields_data['Payment term']
                    paymenttp.company = company_id
                    paymenttp.create_by_user_id = user_id
                    paymenttp.active = True
                    contactp.save()
                    product_tmpl_obj.payment_term_id = paymenttp.id

            product_tmpl_obj.create_by_user = user_obj
            product_tmpl_obj.company = company_id
            product_tmpl_obj.module_type = 'QUOTATION'
            product_tmpl_obj.total_amount = 0

            product_tmpl_obj.save()
            fields_data['success'] = True
        else:
            fields_data['success'] = False
    return fields_data

def get_invoice_data(request):
    data ={'success':False, 'msg':'', 'result':{}}
    company_id = request.user.profile.company_id
    invoice_id = json.loads(request.POST['invoice_id'])
    utils = Utils()
    print(invoice_id)
    try:
        customer_invoice = Customer_invoice.objects.get(encrypt_id=invoice_id, company=company_id)
        if customer_invoice:
            data['result']['total_amount'] = str(utils.round_value(customer_invoice.total_amount))
            data['result']['name'] = customer_invoice.name
            data['success'] = True
    except Customer_invoice.DoesNotExist:
        data['success'] = False
    return HttpResponse(json.dumps(data), content_type='application/json')
