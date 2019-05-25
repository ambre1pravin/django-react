from django.shortcuts import render
from django.http import HttpResponse
from datetime import date, datetime, time, timedelta
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core.files.storage import FileSystemStorage
import json, os, ast
from django.db.models import Q
from next_crm.models import Sale_order, Email_reminder, ContactTab, EmailSendDate, Company, Customer_invoice, Profile, \
    EmailTemplate, AttachDocument,  Sale_order_record, Contact, ContactFieldsValue, Product, Product_unit_of_measure, \
    Product_taxes, Quotation_template, Quotation_template_record, Payment_term, Term, Delivery_method, Opportunity
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from dateutil.relativedelta import relativedelta
import time, csv, calendar
from django.template.loader import render_to_string
from django.db.models import Sum
from next_crm.helper.contact import contact_change_status, test_validate_email
from django.views.decorators.csrf import csrf_exempt
from next_crm.views.CustomerInvoice import display_tax_calculation
from next_crm.helper.utils import Utils
from next_crm.helper.company import get_currency_name, format_date
from next_crm.views.General import save_message, message_create_for_create_action

customers_objs = [{"name": "Delta Pc", "id": 1, "email": "example1@gmail.com"},
                  {"name": "Orman GT", "id": 2, "email": "example2@gmail.com"},
                  {"name": "Pecho Dy", "id": 3, "email": "example3@gmail.com"}]


@login_required(login_url="/login/")
def list(request, id=''):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def dashboardData(request):
    data = {}
    company_id = request.user.profile.company_id
    quatation_list = []
    salers_list = []
    Customer_list = []
    datewise = []
    qtotal_amount = 0
    ctotal_amount = 0
    stotal_amount = 0
    csubtotal_amount = 0
    csubtotal_amount_avg = 0
    ctotal_amount_avg = 0
    ctex = 0
    user_obj = request.user
    user_id = user_obj.id
    json_data = json.loads(request.POST['fields'])
    format_data = formatFields(json_data)
    startDate = format_data['startDate']
    endDate = format_data['endDate']
    start_label = format_data['start_label']
    end_label = format_data['end_label']
    chosenlabel = format_data['chosenlabel']
    endDate1 = datetime.strptime(endDate, "%Y-%m-%d").date()
    startDate1 = datetime.strptime(startDate, "%Y-%m-%d").date()
    intervals = endDate1 - startDate1
    limit = 5
    currency = get_currency_name(company_id)
    quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION',
                                                created_at__range=[startDate, endDate]).order_by('-id')[:5]
    quatations_objs_length = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION',
                                                       created_at__range=[startDate, endDate])
    length_quatations = len(quatations_objs_length)
    if len(quatations_objs) > 0:
        for o in quatations_objs:
            order_date = None

            customer_name = None
            if o.customer_id is not None:
                customer_name = o.customer_name

            if o.order_date is not None:
                order_date = o.order_date.strftime('%d-%m-%Y')

            status = getQoutationStatus(o.status)

            can_remove = False;
            if o.status == 'draft' or o.status == 'cancel':
                can_remove = True

            quatation_list.append({'id': o.id,
                                   'user_id': o.create_by_user_id,
                                   'qt_num': o.name,
                                   'order_date': order_date,
                                   'customer': customer_name,
                                   'sales_person': 'Administrator',
                                   'total': o.total_amount,
                                   'status': status,
                                   'can_remove': can_remove
                                   })
            if o.total_amount is not None:
                qtotal_amount = qtotal_amount + int(o.total_amount)

    salers_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION', status='sale',
                                            created_at__range=[startDate, endDate]).order_by('-id')[:5]
    salers_objs_length = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION', status='sale',
                                                   created_at__range=[startDate, endDate])
    length_salers = len(salers_objs_length)
    if len(salers_objs) > 0:
        for o in salers_objs:
            order_date = None
            customer_name = None
            if o.customer_id is not None:
                customer_name = o.customer_name
            if o.order_date is not None:
                order_date = o.order_date.strftime('%Y-%m-%d')

            can_remove = False;
            if o.status == 'draft' or o.status == 'cancel':
                can_remove = True

            status = 'To Invoice'
            Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id=o.id)
            for invoice1 in Invoicing_objs1:
                if invoice1.invoice_status == 'all' or invoice1.invoice_status == 'delivered' or invoice1.invoice_status == 'email':
                    status = 'Nothing Invoice'

            salers_list.append({'id': o.id,
                                'user_id': o.create_by_user_id,
                                'qt_num': o.name,
                                'order_date': order_date,
                                'customer': customer_name,
                                'sales_person': 'Administrator',
                                'total': o.total_amount,
                                'status': status,
                                'can_remove': can_remove
                                })
            if o.total_amount is not None:
                stotal_amount = stotal_amount + int(o.total_amount)

    Customer_objs = Customer_invoice.objects.filter(company_id=company_id,
                                                    created_at__range=[startDate, endDate]).order_by('-id')[:5]
    Customer_objs_length = Customer_invoice.objects.filter(company_id=company_id, created_at__range=[startDate, endDate])
    length_Customer = len(Customer_objs_length)
    if len(Customer_objs) > 0:
        for o in Customer_objs:
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

            Customer_list.append({'id': o.id,
                                  'customer': o.customer_name,
                                  'invoice_date': invoice_date,
                                  'invoice_number': o.name,
                                  'checkbox_email': o.checkbox_email,
                                  'sales_person': user_obj.username,
                                  'due_date': due_date,
                                  'due_dated': due_dated,
                                  'email_due_date': email_due_date,
                                  'source_document': o.quotation_name,
                                  'total': float(o.total_amount),
                                  'amount_due': o.amount_due,
                                  'status': o.status,
                                  'can_remove': can_remove,
                                  })

            if o.total_amount is not None:
                csubtotal_amount = csubtotal_amount + float(o.subtotal_amount)
                ctotal_amount = ctotal_amount + float(o.total_amount)
                ctex = float(ctotal_amount) - float(csubtotal_amount)
                csubtotal_amount_avg = csubtotal_amount / len(Customer_objs)
                ctotal_amount_avg = ctotal_amount / len(Customer_objs)

    data['salers_list'] = salers_list
    data['quatation_list'] = quatation_list
    data['Customer_list'] = Customer_list
    data['ctotal_amount'] = ctotal_amount
    data['csubtotal_amount'] = csubtotal_amount
    data['csubtotal_amount_avg'] = csubtotal_amount_avg
    data['ctex'] = ctex
    data['ctotal_amount_avg'] = ctotal_amount_avg
    data['total_amount'] = qtotal_amount
    data['stotal_amount'] = stotal_amount
    data['currency'] = currency
    data['length_quatations'] = length_quatations
    data['length_salers'] = length_salers
    data['length_Customer'] = length_Customer

    return HttpResponse(json.dumps(data), content_type="application/json")


@login_required(login_url="/login/")
def getChartData(request):
    data = {}
    company_id = request.user.profile.company_id
    quatation_list = []
    salers_list = []
    Customer_list = []
    datewise = []
    qtotal_amount = 0
    ctotal_amount = 0
    stotal_amount = 0
    csubtotal_amount = 0
    csubtotal_amount_avg = 0
    ctotal_amount_avg = 0
    ctex = 0
    user_obj = request.user
    user_id = user_obj.id
    json_data = json.loads(request.POST['fields'])
    format_data = formatFields(json_data)
    startDate = format_data['startDate']
    endDate = format_data['endDate']
    start_label = format_data['start_label']
    end_label = format_data['end_label']
    chosenlabel = format_data['chosenlabel']
    endDate1 = datetime.strptime(endDate, "%Y-%m-%d").date()
    startDate1 = datetime.strptime(startDate, "%Y-%m-%d").date()
    intervals = endDate1 - startDate1
    limit = 5
    total = 0
    total_amount = 0
    total_list = []
    idate2 = []
    day_name = []
    currency = get_currency_name(company_id)

    if chosenlabel == 'Last 7 Days':
        for i in range(intervals.days + 1):
            idate = startDate1 + timedelta(days=i)
            idate1 = str(idate)
            idate3 = calendar.day_name[idate.weekday()]
            idate44 = datetime.strptime(idate1, "%Y-%m-%d").date()
            quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION',
                                                        created_at__date=idate1).aggregate(Sum('total_amount'))
            salers_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION', status='sale',
                                                    created_at__date=idate1).aggregate(Sum('total_amount'))
            Customer_objs = Customer_invoice.objects.filter(company_id=company_id, created_at__date=idate1).aggregate(
                Sum('total_amount'))
            idate2.append(idate1)
            day_name.append(idate3)

            if quatations_objs['total_amount__sum'] is not None:
                qtotal_amount_sum = quatations_objs['total_amount__sum']
            else:
                qtotal_amount_sum = 0

            if salers_objs['total_amount__sum'] is not None:
                stotal_amount_sum = salers_objs['total_amount__sum']
            else:
                stotal_amount_sum = 0

            if Customer_objs['total_amount__sum'] is not None:
                ctotal_amount_sum = Customer_objs['total_amount__sum']
            else:
                ctotal_amount_sum = 0

            quatation_list.append(qtotal_amount_sum)
            salers_list.append(stotal_amount_sum)
            Customer_list.append(ctotal_amount_sum)

        date_label = day_name
        data_quatations = quatation_list
        data_salers = salers_list
        data_Customer = Customer_list



    elif chosenlabel == 'Today' or chosenlabel == 'Yesterday':
        for i in range(intervals.days + 1):
            idate = startDate1 + timedelta(days=i)
            idate1 = str(idate)
            idate3 = calendar.day_name[idate.weekday()]
            idate44 = datetime.strptime(idate1, "%Y-%m-%d").date()
            quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION',
                                                        created_at__date=idate1).aggregate(Sum('total_amount'))
            salers_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION', status='sale',
                                                    created_at__date=idate1).aggregate(Sum('total_amount'))
            Customer_objs = Customer_invoice.objects.filter(company_id=company_id, created_at__date=idate1).aggregate(
                Sum('total_amount'))
            idate2.append(idate1)
            day_name.append(idate3)

            if quatations_objs['total_amount__sum'] is not None:
                qtotal_amount_sum = quatations_objs['total_amount__sum']
            else:
                qtotal_amount_sum = 0

            if salers_objs['total_amount__sum'] is not None:
                stotal_amount_sum = salers_objs['total_amount__sum']
            else:
                stotal_amount_sum = 0

            if Customer_objs['total_amount__sum'] is not None:
                ctotal_amount_sum = Customer_objs['total_amount__sum']
            else:
                ctotal_amount_sum = 0

            quatation_list.append(qtotal_amount_sum)
            salers_list.append(stotal_amount_sum)
            Customer_list.append(ctotal_amount_sum)

        date_label = [start_label + ' To ' + end_label]

        data_quatations = quatation_list
        data_salers = salers_list
        data_Customer = Customer_list

    elif chosenlabel == 'This Month' or chosenlabel == 'Last Month' or chosenlabel == 'Last 30 Days':
        for i in range(intervals.days + 1):
            idate = startDate1 + timedelta(days=i)
            idate1 = str(idate)
            idate3 = calendar.day_name[idate.weekday()]
            idate44 = idate.strftime('   %d  %b   ')
            quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION',
                                                        created_at__date=idate1).aggregate(Sum('total_amount'))
            salers_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION', status='sale',
                                                    created_at__date=idate1).aggregate(Sum('total_amount'))
            Customer_objs = Customer_invoice.objects.filter(company_id=company_id, created_at__date=idate1).aggregate(
                Sum('total_amount'))
            idate2.append(idate44)
            day_name.append(idate3)

            if quatations_objs['total_amount__sum'] is not None:
                qtotal_amount_sum = quatations_objs['total_amount__sum']
            else:
                qtotal_amount_sum = 0

            if salers_objs['total_amount__sum'] is not None:
                stotal_amount_sum = salers_objs['total_amount__sum']
            else:
                stotal_amount_sum = 0

            if Customer_objs['total_amount__sum'] is not None:
                ctotal_amount_sum = Customer_objs['total_amount__sum']
            else:
                ctotal_amount_sum = 0

            quatation_list.append(qtotal_amount_sum)
            salers_list.append(stotal_amount_sum)
            Customer_list.append(ctotal_amount_sum)

        date_label = idate2

        data_quatations = quatation_list
        data_salers = salers_list
        data_Customer = Customer_list

    else:
        for i in range(intervals.days + 1):
            idate = startDate1 + timedelta(days=i)
            idate1 = str(idate)
            idate3 = calendar.day_name[idate.weekday()]
            idate44 = idate.strftime('   %d  %b   ')
            quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION',
                                                        created_at__date=idate1).aggregate(Sum('total_amount'))
            salers_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION', status='sale',
                                                    created_at__date=idate1).aggregate(Sum('total_amount'))
            Customer_objs = Customer_invoice.objects.filter(company_id=company_id, created_at__date=idate1).aggregate(
                Sum('total_amount'))
            idate2.append(idate44)
            day_name.append(idate3)

            if quatations_objs['total_amount__sum'] is not None:
                qtotal_amount_sum = quatations_objs['total_amount__sum']
            else:
                qtotal_amount_sum = 0

            if salers_objs['total_amount__sum'] is not None:
                stotal_amount_sum = salers_objs['total_amount__sum']
            else:
                stotal_amount_sum = 0

            if Customer_objs['total_amount__sum'] is not None:
                ctotal_amount_sum = Customer_objs['total_amount__sum']
            else:
                ctotal_amount_sum = 0

            quatation_list.append(qtotal_amount_sum)
            salers_list.append(stotal_amount_sum)
            Customer_list.append(ctotal_amount_sum)
        if i < 1:
            date_label = [start_label + ' To ' + end_label]
        elif i >= 1 and i < 7:
            date_label = day_name
        else:
            date_label = idate2

        data_quatations = quatation_list
        data_salers = salers_list
        data_Customer = Customer_list

    data['date_label'] = date_label
    data['salers_list'] = salers_list
    data['quatation_list'] = quatation_list
    data['Customer_list'] = Customer_list
    data['ctotal_amount'] = ctotal_amount
    data['csubtotal_amount'] = csubtotal_amount
    data['csubtotal_amount_avg'] = csubtotal_amount_avg
    data['ctex'] = ctex
    data['ctotal_amount_avg'] = ctotal_amount_avg
    data['total_amount'] = qtotal_amount
    data['stotal_amount'] = stotal_amount
    data['currency'] = currency
    data['data_quatations'] = data_quatations
    data['data_salers'] = data_salers
    data['data_Customer'] = data_Customer

    return HttpResponse(json.dumps(data), content_type="application/json")



@login_required(login_url="/login/")
@csrf_exempt
def listdata(request):
    utils = Utils()
    data = {}
    company_id = request.user.profile.company_id
    quatation_list = []
    total_amount = 0
    user_obj = request.user
    user_id = user_obj.id
    currency = get_currency_name(company_id)
    limit = settings.PAGGING_LIMIT

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    if request.method == "POST":
        json_data = json.loads(request.POST['fields'])
        parameter = formatFields(json_data)
        id_list = json.loads(request.POST['id'])
        dic_name = json.loads(request.POST['names'])
        dic_total = json.loads(request.POST['total_amount'])
        dic_customer = json.loads(request.POST['customer'])
        query = Q()
        total = Q()
        customer = Q()
        filter_list =[]
        if "won_lost_filter" in request.POST:
            filter_list = json.loads(request.POST['won_lost_filter'])

        offset = int(parameter['offset'])
        limit = offset + int(limit)
        orderby = "-id"

        if 'ROLE_MANAGE_ALL_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
            if len(filter_list) > 0:
                if id_list is not None and id_list != '':
                    quatations_objs = Sale_order.objects.filter(opportunity_id=id_list).order_by('id')
                else:
                    quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION',
                                                                status__in=filter_list).order_by('id')
                    if len(dic_name) > 0:
                        for name in dic_name:
                            query = query | Q(name__icontains=name)
                        quatations_objs = quatations_objs.filter(query)
                    if len(dic_total) > 0:
                        for totale in dic_total:
                            total = total | Q(total_amount__icontains=totale)
                        quatations_objs = quatations_objs.filter(total)
                    if len(dic_customer) > 0:
                        for customers in dic_customer:
                            customer = customer | Q(customer_name__icontains=customers)
                        quatations_objs = quatations_objs.filter(customer)
            else:
                if id_list is not None and id_list != '':
                    quatations_objs = Sale_order.objects.filter(opportunity_id=id_list).order_by('id')

                else:
                    quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION').order_by(
                        'id')
                    if len(dic_name) > 0:
                        for name in dic_name:
                            query = query | Q(name__icontains=name)
                        quatations_objs = quatations_objs.filter(query)
                    if len(dic_total) > 0:
                        for totale in dic_total:
                            total = total | Q(total_amount__icontains=totale)
                        quatations_objs = quatations_objs.filter(total)
                    if len(dic_customer) > 0:
                        for customers in dic_customer:
                            customer = customer | Q(customer_name__icontains=customers)
                        quatations_objs = quatations_objs.filter(customer)

        elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles:
            if len(filter_list) > 0:
                if id_list is not None and id_list != '':
                    quatations_objs = Sale_order.objects.filter(opportunity_id=id_list).order_by('id')

                else:
                    quatations_objs = Sale_order.objects.filter(create_by_user=user_id, module_type='QUOTATION',
                                                                status__in=filter_list).order_by('id')
                    if len(dic_name) > 0:
                        for name in dic_name:
                            query = query | Q(name__icontains=name)
                        quatations_objs = quatations_objs.filter(query)

                    if len(dic_total) > 0:
                        for totale in dic_total:
                            total = total | Q(total_amount__icontains=totale)
                        quatations_objs = quatations_objs.filter(total)

                    if len(dic_customer) > 0:
                        for customers in dic_customer:
                            customer = customer | Q(customer_name__icontains=customers)
                        quatations_objs = quatations_objs.filter(customer)
            else:
                if id_list is not None and id_list != '':
                    quatations_objs = Sale_order.objects.filter(opportunity_id=id_list).order_by('id')

                else:
                    quatations_objs = Sale_order.objects.filter(create_by_user=user_id,
                                                                module_type='QUOTATION').order_by('id')

                    if len(dic_name) > 0:
                        for name in dic_name:
                            query = query | Q(name__icontains=name)
                        quatations_objs = quatations_objs.filter(query)

                    if len(dic_total) > 0:
                        for totale in dic_total:
                            total = total | Q(total_amount__icontains=totale)
                        quatations_objs = quatations_objs.filter(total)

                    if len(dic_customer) > 0:
                        for customers in dic_customer:
                            customer = customer | Q(customer_name__icontains=customers)
                        quatations_objs = quatations_objs.filter(customer)



        total_quots = len(quatations_objs)
        quatations_objs = quatations_objs.order_by(orderby)
        quatations_objs = quatations_objs[offset:limit]
        data['total_count'] = total_quots
        if len(quatations_objs) > 0:
            for o in quatations_objs:
                order_date = None
                customer_name = None
                if o.customer_id is not None:
                    customer_name = o.customer_name
                if o.order_date is not None:
                    order_date = format_date(o.order_date, request.user.profile.company.currency)
                status = getQoutationStatus(o.status)
                can_remove = False
                if o.status == 'draft' or o.status == 'cancel':
                    can_remove = True

                quatation_list.append({'id': o.id,
                                       'uuid':str(o.uuid),
                                       'user_id': o.create_by_user_id,
                                       'qt_num': o.name,
                                       'order_date': order_date,
                                       'customer': customer_name,
                                       'sales_person': 'Administrator',
                                       'total': utils.round_value(o.total_amount),
                                       'status': status,
                                       'can_remove': can_remove,
                                       'enc_url': str(o.uuid),
                                       })
                if o.total_amount is not None:
                    total_amount = total_amount + int(o.total_amount)

    data['quatation_list'] = quatation_list
    data['total_amount'] = utils.round_value(total_amount)
    data['currency'] = currency

    return HttpResponse(json.dumps(data), content_type="application/json")




def getQoutationStatus(status):
    status_dict = {
        'draft': 'Quotation',
        'sent': 'Quotation Sent',
        'sale': 'Sales Order',
        'cancel': 'Cancelled'
    }

    return status_dict.get(status, 'Quotation')


@login_required(login_url="/login/")
def preview(request, preview_id, previewtype):
    return render(request, 'web/app.html')


def pdf_html(request, uuid, report_for):
    data = {}
    data['success'] = False
    pdf_obj = Sale_order.objects.get(uuid=uuid)
    if pdf_obj:
        company_id = pdf_obj.company_id
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)

        # To do refactor below code
        context = getQuotationData(preview_id, company_id, user_id, roles, currency, report_for)
        discount = []
        opdiscount = []
        pdis = False
        opdis = False
        is_product_tax = False
        is_op_product_tax = False
        for pro in context['products']:
            if "discount" in pro and float(pro['discount']) > 0.00:
                pdis = True
                discount.append(pdis)
            else:
                discount.append(pdis)

            if pro['product_tax_name']:
                is_product_tax = True

        for op in context['optional_products']:
            if op['discount'] > 0:
                opdis = True
                opdiscount.append(opdis)
            else:
                opdiscount.append(opdis)

            if op['product_tax_name']:
                is_op_product_tax = True

        pdiscount = not any(discount)
        opdiscount = not any(opdiscount)
        context['is_product_discount'] = pdis
        context['is_product_tax'] = is_product_tax
        context['is_opt_discount'] = opdis
        context['is_op_product_tax'] = is_op_product_tax
        context['pdiscount'] = pdiscount
        context['opdiscount'] = opdiscount
        context['print_link'] = '/generate_pdf/' + uuid + '/' + report_for + '/'
        return render(request, 'web/quotation/pdf_html.html', context)


def pdf_download(request, uuid):
    data = {}
    data['success'] = False
    pdf_obj = Sale_order.objects.get(uuid=uuid)
    if pdf_obj:
        company_id = pdf_obj.company_id
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)
        context = getQuotationData(preview_id, company_id, user_id, roles, currency)

        discount = []
        opdiscount = []
        pdis = False
        opdis = False
        is_product_tax = False
        is_op_product_tax = False
        for pro in context['products']:
            if pro['discount'] and float(pro['discount']) > 0.00:
                pdis = True
                discount.append(pdis)
            else:
                discount.append(pdis)
            if pro['product_tax_name']:
                is_product_tax = True

        for op in context['optional_products']:
            if op['discount'] > 0:
                opdis = True
                opdiscount.append(opdis)
            else:
                opdiscount.append(opdis)

            if op['product_tax_name']:
                is_op_product_tax = True

        pdiscount = not any(discount)
        opdiscount = not any(opdiscount)
        context['is_product_discount'] = pdis
        context['is_product_tax'] = is_product_tax
        context['is_opt_discount'] = opdis
        context['is_op_product_tax'] = is_op_product_tax
        context['pdiscount'] = pdiscount
        context['opdiscount'] = opdiscount
        return render(request, 'web/quotation/home_page.html', context)


def document_header(request, uuid, report_for):
    data = {}
    data['success'] = False
    pdf_obj = Sale_order.objects.get(uuid=uuid)
    if pdf_obj:
        company_id = pdf_obj.company_id
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)
        context = getQuotationData(preview_id, company_id, user_id, roles, currency, report_for)
        return render(request, 'web/quotation/header.html', context)


def document_footer(request, uuid):
    data = {}
    data['success'] = False
    pdf_obj = Sale_order.objects.get(uuid=uuid)
    if pdf_obj:
        company_id = pdf_obj.company_id
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency = get_currency_name(company_id)
        context = getQuotationData(preview_id, company_id, user_id, roles, currency, None)
        return render(request, 'web/quotation/footer.html', context)


@login_required(login_url="/login/")
def add(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
@csrf_exempt
def adddata(request):
    data = {'success':True}
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    currency = get_currency_name(company_id)
    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    data['currency'] = currency
    return HttpResponse(json.dumps(data), content_type="application/json")


def getPorTaxes(company_id, user_id, roles):
    taxes_list = []
    utils = Utils()
    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        taxes_obj = Product_taxes.objects.filter(scope='sale', company_id=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        taxes_obj = Product_taxes.objects.filter(scope='sale', user_id=user_id)

    for o in taxes_obj:
        taxes_list.append({'id': o.id, 'name': o.name, 'value': utils.round_value(o.value), 'computation': o.computation})

    return taxes_list













def getUOMforProduct(category_id, company_id):
    uom_list = []
    if category_id != '':
        uom_objs = Product_unit_of_measure.objects.filter(category_id=category_id, company_id=company_id)
    else:
        uom_objs = Product_unit_of_measure.objects.filter(company_id=company_id)

    for uom in uom_objs:
        uom_list.append({
            'id': uom.id,
            'name': uom.name
        })

    return uom_list


@login_required(login_url="/login/")
def saveQuatation(request):
    utils = Utils()
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    json_data = json.loads(request.POST['fields'])

    sale_order_obj = Sale_order()
    sale_order_obj.company_id = company_id
    sale_order_obj.create_by_user = user_obj
    sale_order_obj.sales_person_id = user_id
    sale_order_obj.module_type = 'QUOTATION'
    if json_data['module_name'] == 'quotation':
        sale_order_obj.status = 'draft'
    elif json_data['module_name'] == 'sales-order':
        sale_order_obj.status = 'sale'
    sale_order_obj.invoice_status = 'no'
    sale_order_obj.customer_order_reference = 'customer reference'

    if 'opportunity_id' in json_data and json_data['opportunity_id'] is not None and json_data['opportunity_id'] != '':
        sale_order_obj.opportunity_id = int(json_data['opportunity_id'])

    if 'customer_id' in json_data and json_data['customer_id'] != '' and int(json_data['customer_id']) > 0:
        sale_order_obj.customer_id = int(json_data['customer_id'])

    if 'customer_name' in json_data and json_data['customer_name'] != '':
        sale_order_obj.customer_name = json_data['customer_name']

    if 'quot_tmpl' in json_data and json_data['quot_tmpl'] != '':
        sale_order_obj.qout_template_id = int(json_data['quot_tmpl'])

    TODAY = datetime.today()
    mon_rel = relativedelta(months=1)
    expiration_date_else = TODAY + mon_rel

    if 'order_date' in json_data and json_data['order_date'] != '':
        sale_order_obj.order_date = datetime.strptime(json_data['order_date'], "%m/%d/%Y")
    else:
        sale_order_obj.order_date = datetime.today()

    if 'expexted_closing' in json_data and json_data['expexted_closing'] != '':
        sale_order_obj.expiration_date = datetime.strptime(json_data['expexted_closing'], "%m/%d/%Y")
    else:
        sale_order_obj.expiration_date = expiration_date_else

    if 'payment_term' in json_data and json_data['payment_term'] != '' and int(json_data['payment_term']) != 0:
        sale_order_obj.payment_term_id = int(json_data['payment_term'])

    if 'delivery_method' in json_data and json_data['delivery_method'] != '':
        sale_order_obj.delivery_method_id = int(json_data['delivery_method'])

    if 'tax_amt' in json_data and json_data['tax_amt'] != '':
        sale_order_obj.tax_amount = utils.round_value(json_data['tax_amt'])

    if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
        sale_order_obj.amount_untaxed = utils.round_value(json_data['untaxed_amt'])
        if 'tax_amt' in json_data and json_data['tax_amt'] != '':
            sale_order_obj.total_amount = utils.round_value(json_data['untaxed_amt']) + utils.round_value(
                json_data['tax_amt'])
        else:
            sale_order_obj.total_amount = utils.round_value(json_data['untaxed_amt'])

    if 'optax_amt' in json_data and json_data['optax_amt'] != '':
        sale_order_obj.optax_amount = utils.round_value(json_data['optax_amt'])

    if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
        sale_order_obj.opamount_untaxed = utils.round_value(json_data['opuntaxed_amt'])
        if 'optax_amt' in json_data and json_data['optax_amt'] != '':
            sale_order_obj.optotal_amount = utils.round_value(json_data['opuntaxed_amt']) + utils.round_value(
                json_data['optax_amt'])
        else:
            sale_order_obj.optotal_amount = utils.round_value(json_data['opuntaxed_amt'])



    if 'notes' in json_data:
        sale_order_obj.notes = json_data['notes']

    sale_order_obj.save()

    so_id = sale_order_obj.id
    customer_id = sale_order_obj.customer_id

    total_quotations = Sale_order.objects.filter(company_id=company_id).count()
    name = 'SO'
    if total_quotations > 0:
        str_count = str(total_quotations)
        if len(str_count) == 1:
            name = name + '00' + str_count
        elif len(str_count) == 2:
            name = name + '0' + str_count
        elif len(str_count) > 2:
            name = name + str_count
    else:
        name = name + str(total_quotations + 1)

    sale_order_obj.name = name
    sale_order_obj.save()

    if so_id > 0:
        addProduct(json_data['products'], 'order', sale_order_obj, user_obj, company_id, customer_id)
        addProduct(json_data['optional_products'], 'optional', sale_order_obj, user_obj, company_id, customer_id)
        addEmailreminder(json_data['options_numbers'], sale_order_obj, user_obj, company_id)
        contact_change_status(customer_id, 'lead')
        message = json_data['module_name'].title()+ " " + "\"" + sale_order_obj.name + "\"" + ' has been created by ' + request.user.get_full_name().title()
        contact_create_action_dic = {'company_id': company_id, 'message': message,
                                     'module_name': json_data['module_name'],
                                     'module_object': sale_order_obj, 'user': request.user}
        message_create_for_create_action(contact_create_action_dic)

    data['success'] = True
    data['id'] = so_id
    data['uuid'] = str(sale_order_obj.uuid)
    return HttpResponse(json.dumps(data), content_type="application/json")


# update quotation data
@login_required(login_url="/login/")
def updateQuatation(request):
    utils = Utils()
    data = {'success':False}
    company_id = request.user.profile.company_id
    user_obj = request.user

    json_data = json.loads(request.POST['fields'])

    if 'id' in json_data and json_data['id']:
        try:
            sale_order_obj = Sale_order.objects.get(uuid=json_data['id'])
            sale_order_obj.update_by_user = user_obj

            if 'customer_id' in json_data and json_data['customer_id'] != '' and int(json_data['customer_id']) > 0:
                sale_order_obj.customer_id = int(json_data['customer_id'])
            else:
                sale_order_obj.customer_id = None

            if 'customer_name' in json_data and json_data['customer_name'] != '':
                sale_order_obj.customer_name = json_data['customer_name']
            else:
                sale_order_obj.customer_name = None

            if 'quot_tmpl' in json_data and json_data['quot_tmpl'] != '':
                sale_order_obj.qout_template_id = int(json_data['quot_tmpl'])
            else:
                sale_order_obj.qout_template_id = None

            TODAY = datetime.today()
            mon_rel = relativedelta(months=1)
            expiration_date_else = TODAY + mon_rel

            if 'order_date' in json_data and json_data['order_date'] != '':
                sale_order_obj.order_date = datetime.strptime(json_data['order_date'], "%m/%d/%Y")
            else:
                sale_order_obj.order_date = datetime.today()

            if 'expexted_closing' in json_data and json_data['expexted_closing'] != '':
                sale_order_obj.expiration_date = datetime.strptime(json_data['expexted_closing'], "%m/%d/%Y")
            else:
                sale_order_obj.expiration_date = expiration_date_else

            if 'payment_term' in json_data and json_data['payment_term'] != '' and int(json_data['payment_term']) != 0:
                sale_order_obj.payment_term_id = int(json_data['payment_term'])

            if 'delivery_method' in json_data and json_data['delivery_method'] != '':
                sale_order_obj.delivery_method_id = int(json_data['delivery_method'])

            if 'tax_amt' in json_data and json_data['tax_amt'] != '':
                sale_order_obj.tax_amount = utils.round_value(json_data['tax_amt'])

            if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
                sale_order_obj.amount_untaxed = utils.round_value(json_data['untaxed_amt'])
                if 'tax_amt' in json_data and json_data['tax_amt'] != '':
                    sale_order_obj.total_amount = utils.round_value(json_data['untaxed_amt']) + utils.round_value(
                        json_data['tax_amt'])
                else:
                    sale_order_obj.total_amount = utils.round_value(json_data['untaxed_amt'])

            if 'optax_amt' in json_data and json_data['optax_amt'] != '':
                sale_order_obj.optax_amount = utils.round_value(json_data['optax_amt'])

            if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
                sale_order_obj.opamount_untaxed = utils.round_value(json_data['opuntaxed_amt'])
                if 'optax_amt' in json_data and json_data['optax_amt'] != '':
                    sale_order_obj.optotal_amount = utils.round_value(json_data['opuntaxed_amt']) + utils.round_value(
                        json_data['optax_amt'])
                else:
                    sale_order_obj.optotal_amount = utils.round_value(json_data['opuntaxed_amt'])

            if 'notes' in json_data:
                sale_order_obj.notes = json_data['notes']

            sale_order_obj.save()

            so_id = sale_order_obj.id
            customer_id = sale_order_obj.customer_id

            Email_reminder.objects.filter(sale_id=sale_order_obj).delete()


            if so_id > 0:
                # print("product Raw", json_data['products']['product_raw'])
                Sale_order_record.objects.filter(order=sale_order_obj).delete()
                addProduct(json_data['products'], 'order', sale_order_obj, user_obj, company_id, customer_id)
                addProduct(json_data['optional_products'], 'optional', sale_order_obj, user_obj, company_id,
                           customer_id)
                addEmailreminder(json_data['options_numbers'], sale_order_obj, user_obj, company_id)
                contact_change_status(customer_id, 'lead')

            data['id'] = so_id
            data['uuid'] = json_data['id']
            data['success'] = True

        except Sale_order.DoesNotExist:
            data['success'] = False

    return HttpResponse(json.dumps(data), content_type='application/json')


def addEmailreminder(options_numbers, so_obj, user_obj, company_id):
    for pro in options_numbers:
        product_data = formatFields(pro['reminder_raw'])
        if product_data['numbers'] is not None and product_data['numbers'] != '':
            so_record_obj = Email_reminder()
            so_record_obj.sale = so_obj
            so_record_obj.numbers = product_data['numbers']
            so_record_obj.event_type = product_data['daytype']
            so_record_obj.email_template_id = product_data['email_template']
            so_record_obj.company_id = company_id
            so_record_obj.create_by_user = user_obj
            so_record_obj.save()


def addProduct(products, line_type, so_obj, user_obj, company_id, customer_id):
    for pro in products:
        if pro['product_id'] is not None and pro['product_id'] != '':
            product = Product.objects.get(uuid=pro['product_id'], company_id=company_id)
            if product:
                so_record_obj = Sale_order_record()
                so_record_obj.order = so_obj
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
                elif line_type == 'optional':
                    so_record_obj.Taxes_id = int(pro['tax']) if 'tax' in pro and pro['tax'] != '' else None
                    so_record_obj.tax_price = float(pro['tax_amt'])
                    so_record_obj.price_subtotal = float(pro['subtotal'])
                    so_record_obj.price_total = float(pro['subtotal']) + float(pro['tax_amt'])
                so_record_obj.line_type = line_type
                so_record_obj.status = 'Quotation'
                so_record_obj.invoice_status = 'no'
                so_record_obj.save()


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields


def getUomlist(company_id, user_id, roles):
    uom_list = []
    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        uom_objs = Product_unit_of_measure.objects.filter(company_id=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        uom_objs = Product_unit_of_measure.objects.filter(company_id=company_id,create_by_id=user_id)

    if len(uom_objs) > 0:
        for uom in uom_objs:
            uom_list.append({'id': uom.id,
                             'name': uom.name
                             })

    return uom_list


# return uom list serach more
def getUomListdata(request):
    data = {}

    uom_list = []
    uom_objs = Product_unit_of_measure.objects.all()

    if len(uom_objs) > 0:
        for uom in uom_objs:

            category_name = ''
            if uom.category is not None:
                category_name = uom.category.name

            uom_list.append({'id': uom.id,
                             'name': uom.name,
                             'category_name': category_name
                             })

    if len(uom_list) > 0:
        data['json_uom'] = uom_list

    return HttpResponse(json.dumps(data), content_type="application/json")


@login_required(login_url="/login/")
def view(request, view_id):
    return render(request, 'web/app.html')


def getTaxesListdata(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"
    data = {}

    json_taxes = getPorTaxes(company_id, user_id, roles)

    if len(json_taxes):
        data['json_taxes'] = json_taxes

    return HttpResponse(json.dumps(data), content_type="application/json")


def viewdata(request, uuid):
    data = {'success':False}
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    try:
        res = Sale_order.objects.get(uuid=uuid, company_id=company_id)
        if res:
            view_id = res.id
            currency = get_currency_name(company_id)
            try:
                roles = request.user.profile.roles
            except Profile.DoesNotExist:
                roles = "ADMIN"

            text_invoice = []
            text_invoice12 = []
            quotation_data = getQuotationData(view_id, company_id, user_id, roles, currency, None)
            Invoicing_data = getInvoicingData(view_id, company_id)
            total_Invoicing_data = len(Invoicing_data)

            Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id=view_id,company_id=company_id)

            for invoice1 in Invoicing_objs1:

                text_invoice.append(invoice1.invoice_status)
                if 'all' in text_invoice or 'delivered' in text_invoice:
                    text_invoice12 = 'YES'
                else:
                    text_invoice12 = 'NO'

            if quotation_data is not None:
                data['quotation'] = quotation_data
                data['Invoicing'] = Invoicing_data
                data['text_invoice'] = text_invoice
                data['text_invoice12'] = text_invoice12
                data['total_Invoicing_data'] = total_Invoicing_data
                data['user_id'] = user_id
                data['success'] = True

    except Sale_order.DoesNotExist:
        pass

    return HttpResponse(json.dumps(data), content_type='application/json')


def getInvoicingData(view_id, company_id):
    invoicing_list = []
    Invoicing_objs = Customer_invoice.objects.filter(quotation_id=view_id,company_id=company_id)
    for invoice in Invoicing_objs:
        invoicing_list.append({'id': invoice.id,
                               'invoice_status': invoice.invoice_status})

    return invoicing_list


def getOpIdList(request, company_id, user_id, roles):
    op_id_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION').order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(company_id=company_id, create_by_user_id=user_id, module_type='QUOTATION').order_by('id')

    for op in op_objs:
        op_id_list.append({'id': op.id})

    return op_id_list


def getOpIdListedit(request, company_id, user_id, roles):
    op_id_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION').order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(company_id=company_id, create_by_user_id=user_id, module_type='QUOTATION').order_by('id')

    for op in op_objs:
        op_id_list.append({'id': op.id})

    return op_id_list


def getQuotationData(id, company_id, user_id, roles, currency, report_for=None):
    utils = Utils()
    try:
        quatations_obj = Sale_order.objects.get(pk=int(id), company_id=company_id)

        customer_name = ''
        customer_id = ''
        if quatations_obj.customer_id is not None:
            customer_id = quatations_obj.customer_id
            customer_name = quatations_obj.customer_name

        quot_tmpl_id = ''
        quot_tmpl_name = ''
        if quatations_obj.qout_template is not None:
            quot_tmpl_id = quatations_obj.qout_template_id
            quot_tmpl_name = quatations_obj.qout_template.name

        payment_term_id = ''
        pay_tm_name = ''
        if quatations_obj.payment_term is not None:
            payment_term_id = quatations_obj.payment_term_id
            pay_tm_name = quatations_obj.payment_term.name

        dm_id = ''
        dm_name = ''

        if quatations_obj.delivery_method is not None:
            dm_id = quatations_obj.delivery_method_id
            dm_name = quatations_obj.delivery_method.name

        profile_image = ''
        profile_image1 = ''
        contactp = Contact.objects.get(id=customer_id)
        fields = {"Street": '', "Street2": '', "City": '', "State": '', "Country": '', "Zip": '', "Mobile": ''}
        contact_field_value_id = ''

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
                company_address_billing_country = cpt.billing_country.label if cpt.billing_country is not None else ''
                company_address_billing_zip = cpt.billing_zip if cpt.billing_zip is not None else ''
                company_street = cpt.street if cpt.street is not None else ''
                company_city = cpt.city if cpt.city is not None else ''
                company_zip = cpt.zip if cpt.zip is not None else ''
                company_country = cpt.country.label if cpt.country is not None else ''
                company_logo = settings.HOST_NAME_WITHOUT_SLASH + cpt.profile_image if cpt.profile_image else None
        firstname = ''
        lastname = ''
        user_detail = User.objects.filter(id=cuser_id)
        if user_detail is not None:
            for utp in user_detail:
                firstname = utp.first_name
                lastname = utp.last_name

        email = ''
        legacy_information = ''

        user_detail = User.objects.get(id=user_id)
        if user_detail:
            email = user_detail.email
            legacy_information = user_detail.company.quotation_legacy_information

        phone = ''
        profile_detail = Profile.objects.filter(user_id=cuser_id)
        if profile_detail is not None:
            for ptp in profile_detail:
                phone = ptp.phone

        json_address = view_field_value(company_id, customer_id)
        fields = {}
        address_list = json_address
        address_json = ''

        terms_conditions = None
        if quatations_obj.notes:
            terms_conditions = quatations_obj.notes
        elif user_detail and user_detail.company.quotation_term_and_condition:
            terms_conditions = user_detail.company.quotation_term_and_condition

        if quatations_obj.expiration_date != "" and quatations_obj.expiration_date is not None:
            new_dt1 = str(quatations_obj.expiration_date);
            expiration_date1 = datetime.strptime(new_dt1, "%Y-%m-%d").strftime("%d/%m/%Y")
        else:
            expiration_date1 = ''

        order_date1 = ''
        if quatations_obj.order_date != "" and quatations_obj.order_date is not None:
            new_dt2 = str(quatations_obj.order_date);
            order_date1 = datetime.strptime(new_dt2, "%Y-%m-%d").strftime("%d/%m/%Y")
        else:
            order_date1 = ''
        report_name = quatations_obj.name
        first_date_label =''
        second_date_label = 'Expiration Date :'
        if report_for and report_for == 'quotation':
            report_name = 'Your Quotation ' + str(quatations_obj.name)
            first_date_label = 'Quotation Date :'
        elif report_for and report_for == 'sales_order':
            report_name = 'Your Sales Order ' + str(quatations_obj.name)
            first_date_label = 'Sales Order Date '


        expiration_date = ''
        order_date = ''
        if quatations_obj.expiration_date:
            expiration_date = datetime.strptime(str(quatations_obj.expiration_date), "%Y-%m-%d").strftime("%m/%d/%Y")
        if quatations_obj.order_date:
            order_date = datetime.strptime(str(quatations_obj.order_date), "%Y-%m-%d").strftime("%m/%d/%Y")
        quotation_dict = {'id': quatations_obj.id,
                          'user_id': quatations_obj.create_by_user_id,
                          'name': report_name,
                          'firstname': firstname,
                          'lastname': lastname,
                          'company_name': company_name,
                          'company_logo': company_logo,
                          'mobile': mobile,
                          'phone': phone,
                          'email': email,
                          'url': str(quatations_obj.uuid),
                          'currency': currency,
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
                          'customer_id': customer_id,
                          'customer_name': customer_name,
                          'profile_image': profile_image,
                          'profile_image1': profile_image1,
                          'customer_email': contact_field_value_id,
                          'sales_person_id': str(quatations_obj.sales_person_id),
                          'opportunity_id': quatations_obj.opportunity_id,
                          'customer_invoice_id': quatations_obj.customer_invoice_id,
                          'notes': terms_conditions,
                          'customer_order_reference': quatations_obj.customer_order_reference,
                          'expiration_date': expiration_date,
                          'order_date': order_date,
                          'expiration_date1': expiration_date1,
                          'order_date1': order_date1,
                          'qout_tmpl_id': quot_tmpl_id,
                          'qout_tmpl_name': quot_tmpl_name,
                          'payment_term_id': payment_term_id,
                          'pay_tm_name': pay_tm_name,
                          'delivery_method_id': dm_id,
                          'delivery_method_name': dm_name,
                          'amount_untaxed': utils.round_value(quatations_obj.amount_untaxed),
                          'tax_amount': utils.round_value(quatations_obj.tax_amount),
                          'opamount_untaxed': utils.round_value(quatations_obj.opamount_untaxed),
                          'optax_amount': utils.round_value(quatations_obj.optax_amount),
                          'optotal_amount': utils.round_value(quatations_obj.optotal_amount),
                          'status': quatations_obj.status,
                          'invoice_status': quatations_obj.invoice_status,
                          'legacy_information': legacy_information,
                          'first_date_label':first_date_label,
                          'second_date_label':second_date_label

                          }
        # str(round(Decimal(o.total_amount),2))
        if payment_term_id != '' and payment_term_id is not None:
            quotation_dict['payment_term'] = getQuotationPaymenterm(payment_term_id)

        quotation_dict['email_reminder_data'] = getEmailReminder(quatations_obj.id)
        quotation_dict['products'] = getQuotationProduct(quatations_obj.id, 'order', company_id, user_id, roles)
        quotation_dict['optional_products'] = getQuotationProduct(quatations_obj.id, 'optional', company_id, user_id,
                                                                  roles)
        product_tax_return_data = display_tax_calculation(quotation_dict['products'])
        quotation_dict['tax_amount'] = utils.round_value(product_tax_return_data['total_tax'])
        quotation_dict['total_amount'] = utils.round_value(float(quatations_obj.amount_untaxed)+float(product_tax_return_data['total_tax']))
        quotation_dict['multiple_tax'] = product_tax_return_data['multiple_tax_list']

        optional_product_tax_return_data = display_tax_calculation(quotation_dict['optional_products'])
        quotation_dict['op_tax_amount'] = utils.round_value(optional_product_tax_return_data['total_tax'])
        quotation_dict['op_product_multiple_tax'] = optional_product_tax_return_data['multiple_tax_list']

        return quotation_dict

    except Sale_order.DoesNotExist:
        return None


def getEmailReminder(quotation_id):
    data = {}
    eml_tmpl = []

    eml_obj = Email_reminder.objects.filter(sale=quotation_id).order_by('id')
    if len(eml_obj) > 0:
        for o in eml_obj:
            if o.email_template_id != '' and o.email_template_id != None:
                email_template_name = o.email_template.name
            else:
                email_template_name = ''

            eml_tmpl.append({
                'id': o.id,
                'numbers': o.numbers,
                'event_type': o.event_type,
                'email_template': email_template_name,
                'email_template_id': o.email_template_id,
                'email_reminder': True,
            })
    return eml_tmpl


def getQuotationPaymenterm(payment_term_id):
    data = {}
    qout_tmpl = []

    tpml_obj = Term.objects.filter(payment_term=payment_term_id).order_by('order')

    if len(tpml_obj) > 0:
        for o in tpml_obj:
            qout_tmpl.append({
                'id': o.id,
                'due_type': o.due_type,
                'value': o.value,
                'number_days': o.number_days,
                'days': o.days,
            })
    return qout_tmpl


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


def getQuotationProduct(id, line_type, company_id, user_id, roles):
    utils = Utils()
    pro_record_list = []
    s_o_r_dict = Sale_order_record.objects.filter(company_id=company_id, order_id=id, line_type=line_type).order_by('id')
    if len(s_o_r_dict) > 0:
        for o in s_o_r_dict:
            uom_name = ''
            product_name = 'Product Deleted'
            tax_id = ''
            tax_name = ''
            tax_computation = None
            tax_value = None
            json_uom = []
            product_uuid = None
            if o.product_uom is not None:
                uom_name = o.product_uom.name
                if o.product_uom.category_id is not None:
                    json_uom = getUOMforProduct(o.product_uom.category_id, company_id)

            if o.Product is not None:
                product_name = o.Product.internal_reference if o.Product.internal_reference is not None else ''
                product_name = product_name + ' '
                product_name = product_name + o.Product.template_name if o.Product.template_name is not None else ''

                if o.Taxes is not None:
                    tax_id = o.Taxes.id
                    tax_name = o.Taxes.name
                    tax_computation = o.Taxes.computation
                    tax_value = o.Taxes.value

            if o.Product_id:
                product_uuid = str(o.Product.uuid)

            pro_record_list.append({
                'id': o.id,
                'uuid':product_uuid,
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
                'json_uom': json_uom,
            })
    return pro_record_list




@login_required(login_url="/login/")
def edit(request, edit_id):
    return render(request, 'web/app.html')


def editdata(request, uuid):
    data = {'success':False}
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    text_invoice = []
    text_invoice12 = []
    try:
        res = Sale_order.objects.get(uuid=uuid, company_id=company_id)
        if res:
            edit_id = res.id
            currency = get_currency_name(company_id)

            Invoicing_data = getInvoicingData(edit_id, company_id)
            total_Invoicing_data = len(Invoicing_data)

            Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id=edit_id, company_id=company_id)

            for invoice1 in Invoicing_objs1:

                text_invoice.append(invoice1.invoice_status)
                if 'all' in text_invoice or 'delivered' in text_invoice:
                    text_invoice12 = 'YES'
                else:
                    text_invoice12 = 'NO'

            quotation_data = getQuotationData(edit_id, company_id, user_id, roles, currency, None)
            if quotation_data is not None:
                data['quotation'] = quotation_data
                data['Invoicing'] = Invoicing_data
                data['text_invoice'] = text_invoice
                data['text_invoice12'] = text_invoice12
                data['total_Invoicing_data'] = total_Invoicing_data
                data['success'] = True
    except Sale_order.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type='application/json')



@csrf_exempt
def email_upload_file(request):
    user_company_id = request.user.profile.company_id
    return_status = {'success': False, 'file_data':{'url':'','filename':''} }
    if request.method == 'POST' and request.FILES['image']:
        file_path = 'media/files/' + str(user_company_id) + '/email_template'
        f = request.FILES['image']
        fs = FileSystemStorage(location=file_path)
        filename = fs.save(f.name, f)
        uploaded_file_url = '/' + file_path + '/' + filename
        return_status['file_data']['file_path'] = uploaded_file_url
        return_status['file_data']['file_name'] = filename
        return_status['file_data']['is_template_file'] = False
        return_status['success'] = True
    return HttpResponse(json.dumps(return_status), content_type="application/json")

@csrf_exempt
def remove_email_file(request):
    user_company_id = request.user.profile.company_id
    return_status = {'success': False, 'file_data':{'file_path':'','file_name':''}, 'msg':'' }
    if request.method == 'POST':
        json_data = json.loads(request.POST['fields'])
        if 'id' in json_data and int(json_data['id']):
            try:
                template_attchement = AttachDocument.objects.get(id=json_data['id'])
                if template_attchement and template_attchement.file_name == json_data['file_name']:
                    file_path = 'media/files/' + str(user_company_id) + '/email_template/'+json_data['file_name']
                    os.remove(file_path)
                    template_attchement.delete()
            except AttachDocument.DoesNotExist:
                print("AttachDocument.DoesNotExist")

        return_status['success'] = True
    return HttpResponse(json.dumps(return_status), content_type="application/json")






def getEmailTemplateData(request, email_template_id):
    data = {}
    company_id = request.user.profile.company_id
    data['success'] = False
    user_obj = request.user

    email_template_objs = EmailTemplate.objects.get(id=email_template_id, company_id = company_id)

    data['id'] = email_template_objs.id
    data['name'] = email_template_objs.name
    data['subject'] = email_template_objs.subject
    data['description'] = email_template_objs.description

    if email_template_objs.image_path != '' and email_template_objs.image_path is not None:
        eml_list = email_template_objs.image_path.split('|')
    else:
        eml_list = None

    if eml_list != '' and eml_list is not None:
        data['image_path'] = eml_list

    data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')

#suyash
def getEmailTemplate(request, module_type):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    module_type = module_type.lower()
    if module_type == 'quotation':
        module_type = 'quotation'
    elif module_type == 'customerinvoice':
        module_type = 'invoice'
    elif module_type == 'sales-order':
        module_type = 'sales-order'
    com_list = []
    email_template_objs = EmailTemplate.objects.filter(company_id=company_id, is_deleted=False, module_type=module_type).order_by('-id')



    print(email_template_objs.query)

    if len(email_template_objs) > 0:
        for x in email_template_objs[:1]:

            ename = ''
            eid = ''
            esubject = ''
            edescription = ''
            eimage_path = ''

            if x.name is not None:
                ename = x.name
            if x.id is not None:
                eid = x.id
            if x.subject is not None:
                esubject = x.subject
            if x.description is not None:
                edescription = x.description
            if x.image_path != '' and x.image_path is not None:
                eimage_path = x.image_path.split('|')
            data['id'] = eid
            if len(ename) > 0:
                data['name'] = ename
            if len(esubject) > 0:
                data['subject'] = esubject
            if len(edescription) > 0:
                data['description'] = edescription
            if len(eimage_path) > 0:
                data['image_path'] = eimage_path

        for com in email_template_objs:
            name = ''
            if com.name is not None:
                name = com.name

            com_list.append({'id': com.id, 'name': com.name, 'subject': com.subject, 'description': com.description,
                             'image_path': com.image_path})

    if len(com_list) > 0:
        data['email_template_json'] = com_list

    data['email_template_length'] = len(com_list)

    data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')



def get_default_template(request, module_type):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    module_type = module_type.lower()
    if module_type == 'quotation':
        module_type = 'quotation'
    elif module_type == 'customerinvoice':
        module_type = 'invoice'
    elif module_type == 'sales-order':
        module_type = 'sales-order'
    try:
        print("module_type", module_type)
        files_attachment = []
        email_template_objs = EmailTemplate.objects.get(company_id=company_id, is_deleted=False, module_type=module_type, is_default=True)
        if email_template_objs:
            template_attchement = AttachDocument.objects.filter(email_template_id=email_template_objs.id)
            if template_attchement:
                for attachment in template_attchement:
                    files_attachment.append(
                        {'id': attachment.id, 'file_name': attachment.file_name, 'file_path': attachment.file_path, 'is_template_file':True})

        if email_template_objs :
                ename = ''
                eid = ''
                esubject = ''
                edescription = ''
                eimage_path = ''

                if email_template_objs.name is not None:
                    ename = email_template_objs.name
                if email_template_objs.id is not None:
                    eid = email_template_objs.id
                if email_template_objs.subject is not None:
                    esubject = email_template_objs.subject
                if email_template_objs.description is not None:
                    edescription = email_template_objs.description.replace('&nbsp;', "")
                if email_template_objs.image_path != '' and email_template_objs.image_path is not None:
                    eimage_path = email_template_objs.image_path.split('|')
                data['id'] = eid
                if len(ename) > 0:
                    data['name'] = ename
                if len(esubject) > 0:
                    data['subject'] = esubject
                if len(edescription) > 0:
                    data['description'] = edescription
                if len(eimage_path) > 0:
                    data['image_path'] = eimage_path

                data['result']={'id': eid, 'name': ename,
                                'subject': esubject, 'description': edescription.replace('&nbsp;', ""),
                                 'image_path': eimage_path,"module_type":module_type, 'attachment':files_attachment
                                }
                data['success'] = True
    except EmailTemplate.DoesNotExist as e:
        print(e)
    return HttpResponse(json.dumps(data), content_type='application/json')




def sendQuoteEmail(request):
    company_id = request.user.profile.company_id

    data = {'success': False}
    fields = json.loads(request.POST['fields'])
    utils = Utils()
    due_date = ''
    if fields['module_type'] == 'quotation' or fields['module_type'] == 'sales-order':
        res = Sale_order.objects.get(uuid=fields['quotation_id'], company_id=company_id)
        res.status = 'sent'
        res.save()
    elif fields['module_type'] == 'CustomerInvoice':
        res = Customer_invoice.objects.get(encrypt_id=fields['quotation_id'], company=company_id)
    elif fields['module_type'] == 'contact':
        res = Contact.objects.get(id=fields['quotation_id'], user_company_id=company_id)
    elif fields['module_type'] == 'opportunity':
        res = Opportunity.objects.get(id=fields['quotation_id'], company_id=company_id)

    if res:
        if fields['module_type'] == 'quotation':
            replace_pdf_url = settings.HOST_NAME + 'generate_pdf/' + str(res.uuid) + '/quotation/'
            if res.order_date:
                due_date = format_date(res.order_date, request.user.profile.company.currency) #str(res.order_date)

        elif fields['module_type'] == 'sales-order':
            replace_pdf_url = settings.HOST_NAME + 'generate_pdf/' + str(res.uuid) + '/sales_order/'
            if res.order_date:
                due_date = format_date(res.order_date, request.user.profile.company.currency)
        elif fields['module_type'] == 'CustomerInvoice':
            replace_pdf_url = settings.HOST_NAME + 'generate_pdf/' + str(res.encrypt_id) + '/invoice/'
            if res.due_date:
                due_date = format_date(res.order_date, request.user.profile.company.currency)


        external_recipients = fields['external_recipients']
        internal_recipients = fields['internal_recipients']
        recipients = []

        if external_recipients:
            external_recipients = external_recipients[-1].split(",")
            if len(external_recipients) > 0:
                for ext_rep in  external_recipients:
                    email_to = {'email': ext_rep, 'FirstName': None, 'LastName': None, 'CompanyName': None}
                    recipients.append(email_to)

        if len(internal_recipients) > 0:
            for internal_recipient in internal_recipients:
                first_name = None
                last_name = None
                company_name =None
                try:
                    customer = Contact.objects.get(id=int(internal_recipient['id']), user_company_id=company_id)
                    if customer:
                        if customer.first_name:
                            first_name = customer.first_name.title()
                        if customer.last_name:
                            last_name = customer.last_name.title()
                        if customer.contact_type == 'C':
                            company_name = customer.name.title()
                        elif customer.company:
                            company_name = customer.company.name.title()
                        email_to ={'email':customer.email, 'FirstName': first_name, 'LastName': last_name, 'CompanyName': company_name}
                        recipients.append(email_to)
                except Contact.DoesNotExist as e:
                    print(e)


        if len(recipients) > 0:

            if fields['module_type'] != 'contact' and fields['module_type'] != 'opportunity':
                msgdata = fields['content'].replace('[qname]', res.name)
                msgdata = msgdata.replace('[duedate]', due_date)
                amount = str(utils.round_value(res.total_amount)) + ' ' + get_currency_name(company_id)
                msgdata = msgdata.replace('[tamount]', amount)

                button_html = '<div style = "margin-top:30px;text-align:center;"><center>'
                button_html = button_html + '<a href="'+replace_pdf_url+'" style ="color:#fff;text-decoration:none;border-radius:5px;background-color:#229ee6;border-top:10px solid #229ee6;border-bottom:10px solid #229ee6;border-right:15px solid #229ee6;border-left:15px solid #229ee6;" target ="_blank"> View Document Online </a>'
                button_html = button_html + '</center></div>'
                msgdata = msgdata.replace('[url]', button_html)
                msgdata = msgdata.replace('[qname]', res.name)
                msgdata = msgdata.replace('&nbsp;', ' ')
                subject = fields['subject'].replace('[qname]', res.name)
            else:
                msgdata = fields['content']
                subject = fields['subject']

            for recipt in recipients:
                if recipt['FirstName']:
                    msgdata = msgdata.replace('[FirstName]', recipt['FirstName'])
                else:
                    msgdata = msgdata.replace('[FirstName]', '')
                if recipt['LastName']:
                    msgdata = msgdata.replace('[LastName]', ' ' +recipt['LastName'])
                else:
                    msgdata = msgdata.replace('[LastName]', '')
                if recipt['CompanyName']:
                    msgdata = msgdata.replace('[CompanyName]', recipt['CompanyName'])
                else:
                    msgdata = msgdata.replace('[CompanyName]', '')

                if test_validate_email(recipt['email']):

                    print("attatch", fields['attachements'])

                    message_data = {'message': msgdata, 'master_id': res.id,
                                    'module_name': fields['module_type'], 'message_type': 'email_sent',
                                    'attachements': fields['attachements']}
                    message_status = save_message(request, message_data)

                    data['success'] = message_status['success']


                    attachment1 = fields['attachements']
                    company_logo = settings.HOST_NAME_WITHOUT_SLASH + request.user.company.profile_image if request.user.company.profile_image else None
                    company_name = request.user.company.company
                    text_content = "k"
                    result = EmailMultiAlternatives(subject, text_content, settings.EMAIL_FROM, [recipt['email']])
                    msgdata1 = msgdata
                    msg_html = render_to_string('web/quotation/email.html',
                                                {'msgdata1': msgdata1, 'saalz_logo': company_logo,
                                                 'company_name': company_name})
                    result.attach_alternative(msg_html, "text/html")
                    if len(fields['attachements']) > 0:
                        for attachment2 in fields['attachements']:
                            attachment = settings.BASE_DIR + '/media/files/' + str(company_id) + '/email_template/' + attachment2['file_name']
                            result.attach_file(attachment)
                    result.send()
                    data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def saveEmailtemplate(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    fields = json.loads(request.POST['fields'])
    module_type = fields['module'].lower()
    if module_type == 'quotation':
        module_type = 'quotation'
    elif module_type == 'customerinvoice':
        module_type = 'invoice'
    elif module_type == 'sales-order':
        module_type = 'sales-order'
    elif module_type == 'contact':
        module_type = 'contact'
    elif module_type == 'opportunity':
        module_type = 'opportunity'

    if 'template_id' in fields and int(fields['template_id']) > 0:
        email_template_obj = EmailTemplate.objects.get(id=int(fields['template_id']), company_id=company_id)
        email_template_obj.name = fields['template_name']
        email_template_obj.description = fields['editor_txt']
        email_template_obj.subject = fields['subject']
        email_template_obj.module_type = module_type
        email_template_obj.company_id = company_id
        email_template_obj.save()
        save_email_attchement(email_template_obj, fields['attachements'], module_type)
        data['msg'] = 'Template Saved!!.'
        data['success'] = True
    else:
        try:
            email_template_obj = EmailTemplate.objects.get(name__exact=str(fields['template_name']), company_id=company_id)
            data['msg'] = 'Template with same name already exits.'
        except EmailTemplate.DoesNotExist as e:
            email_template_obj = EmailTemplate()
            email_template_obj.name = fields['template_name']
            email_template_obj.description = fields['editor_txt']
            email_template_obj.subject = fields['subject']
            email_template_obj.module_type = module_type
            email_template_obj.company_id = company_id
            email_template_obj.save()
            save_email_attchement(email_template_obj, fields['attachements'], module_type)
            data['msg'] = 'New Template Created!!.'
            data['success'] = True
    data['id'] = email_template_obj.id
    data['name'] = email_template_obj.name
    data['subject'] = email_template_obj.subject
    data['description'] = email_template_obj.description

    return HttpResponse(json.dumps(data), content_type='application/json')

def save_email_attchement(email_template_obj, attachements, module_type):
    if len(attachements) > 0:
        for attachement in attachements:
            try:
                template_attatchement = AttachDocument.objects.get(email_template=email_template_obj, file_name=attachement['file_name'],file_path=attachement['file_path'])
            except AttachDocument.DoesNotExist as e:
                template_attatchement = AttachDocument()
                template_attatchement.email_template=email_template_obj
                template_attatchement.file_name = attachement['file_name']
                template_attatchement.file_path = attachement['file_path']
                template_attatchement.module_name = module_type
                template_attatchement.save()
    return True


def deleteQoutation(request):
    data = {}
    data['success'] = False
    id_list = json.loads(request.POST['ids'])
    if len(id_list) > 0:
        for i in id_list:
            try:
                quot_obj = Sale_order.objects.get(pk=int(i)).delete()
                data['msg'] = 'Deleted sucessfully'
                data['success'] = True
            except quot_obj.DoesNotExist:
                data['msg'] = 'Something is wrong!'
    return HttpResponse(json.dumps(data), content_type='application/json')



def quotationexport(request):
    export_status = {'success': False}
    id_list = json.loads(request.POST['ids'])
    list_dic = []
    data = []
    if len(id_list) > 0:
        for i in id_list:
            quot_obj = Sale_order.objects.filter(pk=int(i))
            for o in quot_obj:
                if o.name is not None and o.name != '':
                    name = o.name
                else:
                    name = ''
                if o.customer_name is not None and o.customer_name != '':
                    customer_name = o.customer_name
                else:
                    customer_name = ''
                if o.order_date is not None and o.order_date != '':
                    order_date = datetime.strptime(str(o.order_date), "%Y-%m-%d").strftime("%d/%m/%Y")
                else:
                    order_date = ''
                if o.total_amount is not None and o.total_amount != '':
                    total_amount = str(o.total_amount)
                else:
                    total_amount = ''
                if o.status is not None and o.status != '':
                    status = o.status
                else:
                    status = ''
                list_dic.append({
                    'Quotation Number': name,
                    'Order Date': order_date,
                    'Customer Name': customer_name,
                    'Total': total_amount,
                    'Status': status,
                })

    if list_dic:
        to_csv = list_dic
        keys1 = to_csv[0].keys()
        keys = (['Quotation Number', 'Order Date', 'Customer Name', 'Total', 'Status'])
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
        product_fileds = Sale_order._meta.get_fields()
        for field in product_fileds:
            fields_dic = {'name': field.name}
            fields.append(fields_dic)

        contact_list['fields'] = [{'name': 'Quotation name'}, {'name': 'Order Date'}, {'name': 'Customer name'},
                                  {'name': 'Expiration Date'}, {'name': 'Status'}, {'name': 'Payment term'},
                                  {'name': 'Quotation template'}]
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
    product_tmpl_obj = Sale_order()
    for fields_data in fields:
        if 'Quotation name' in fields_data and fields_data['Quotation name'] != '':

            product_tmpl_obj.name = fields_data['Quotation name']

            TODAY = datetime.today()
            mon_rel = relativedelta(months=1)
            expiration_date_else = TODAY + mon_rel

            if 'Expiration Date' in fields_data and fields_data['Expiration Date'] != '':
                product_tmpl_obj.expiration_date = datetime.strptime(fields_data['Expiration Date'], "%d/%m/%Y")
            else:
                product_tmpl_obj.expiration_date = expiration_date_else

            if 'Order Date' in fields_data and fields_data['Order Date'] != '':
                product_tmpl_obj.order_date = datetime.strptime(fields_data['Order Date'], "%d/%m/%Y")
            else:
                product_tmpl_obj.order_date = datetime.today()

            if 'Status' in fields_data and fields_data['Status'] != '':
                product_tmpl_obj.status = fields_data['Status']

            if 'Customer name' in fields_data and fields_data['Customer name'] != '':
                try:
                    contactpt = Contact.objects.get(name=fields_data['Customer name'])
                    product_tmpl_obj.customer_id = contactpt.id
                    product_tmpl_obj.customer_name = fields_data['Customer name']
                except:
                    contactp = Contact()
                    contactp.name = fields_data['Customer name']
                    contactp.contact_type = 'C'
                    contactp.is_vendor = False
                    contactp.is_customer = True
                    contactp.user_id = user_id
                    contactp.user_company_id = company_id

                    contactp.save()
                    product_tmpl_obj.customer_id = contactp.id
                    product_tmpl_obj.customer_name = fields_data['Customer name']

            if 'Payment term' in fields_data and fields_data['Payment term'] != '':
                try:
                    payment = Payment_term.objects.get(name=fields_data['Payment term'])
                    product_tmpl_obj.payment_term_id = payment.id
                except:
                    paymenttp = Payment_term()
                    paymenttp.name = fields_data['Payment term']
                    paymenttp.company_id = company_id
                    paymenttp.create_by_user_id = user_id
                    paymenttp.user_company_id = company_id
                    paymenttp.active = True
                    contactp.save()
                    product_tmpl_obj.payment_term_id = paymenttp.id

            if 'Quotation template' in fields_data and fields_data['Quotation template'] != '':
                try:
                    qout = Quotation_template.objects.get(name=fields_data['Quotation template'])
                    product_tmpl_obj.qout_template_id = qout.id
                except:
                    qouttp = Payment_term()
                    qouttp.name = fields_data['Payment term']
                    qouttp.company_id = company_id
                    qouttp.create_by_user_id = user_id
                    qouttp.save()
                    product_tmpl_obj.qout_template_id = qouttp.id

            product_tmpl_obj.create_by_user = user_obj
            product_tmpl_obj.company_id = company_id
            product_tmpl_obj.module_type = 'QUOTATION'
            product_tmpl_obj.total_amount = 0

            product_tmpl_obj.save()
            fields_data['success'] = True

        else:
            fields_data['success'] = False

    return fields_data
