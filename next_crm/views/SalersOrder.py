from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone
from datetime import date, datetime, time
from django.contrib.auth.decorators import login_required
from django.conf import settings
from io import BytesIO

from next_crm.helper.utils import Utils
from django.core.files.storage import FileSystemStorage
import json, os, errno, requests, time, csv, decimal

from django.db.models import Q
from next_crm.models import Sale_order, Company, Customer_invoice, Profile, EmailTemplate, Sale_order_record, ContactTab,Contact, \
    ContactFields, ContactFieldsValue, Product, Product_unit_of_measure, Product_taxes, Quotation_template, \
    Quotation_template_record, Payment_term, Delivery_method
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from dateutil.relativedelta import relativedelta
from next_crm.views.CustomerInvoice import display_tax_calculation
from next_crm.helper.contact import  get_customer_by_id_list, get_valid_email
from next_crm.helper.company import get_currency_name, format_date

customers_objs = [{"name": "Delta Pc", "id": 1, "email": "example1@gmail.com"},
                  {"name": "Orman GT", "id": 2, "email": "example2@gmail.com"},
                  {"name": "Pecho Dy", "id": 3, "email": "example3@gmail.com"}]


@login_required(login_url="/login/")
def list(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def listdata(request):
    data = {}
    utils = Utils()
    company_id = request.user.profile.company_id
    quatation_list = []
    total_amount = decimal.Decimal(0.00)
    user_obj = request.user
    user_id = user_obj.id
    customer_list = customers_objs  # defined at top
    limit = settings.PAGGING_LIMIT
    offset = ""
    Is_Default = []
    currency = get_currency_name(company_id)

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    if request.method == "POST":

        json_data = json.loads(request.POST['fields'])
        parameter = formatFields(json_data)
        name = json.loads(request.POST['names'])
        filter_list = []
        if "won_lost_filter" in request.POST:
            filter_list = json.loads(request.POST['won_lost_filter'])
        offset = int(parameter['offset'])
        limit = offset + int(limit)
        orderby = "-id"
        if 'ROLE_MANAGE_ALL_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
            quatations_objs = Sale_order.objects.filter(company_id=company_id, module_type='QUOTATION').order_by('id')
            like_cond = Q()
            if len(filter_list) > 0:
                orderby = '-id'
                for f in filter_list:
                    like_cond = like_cond | Q(status__icontains=f)
                quatations_objs = quatations_objs.filter(like_cond)
            if len(name) > 0:
                orderby = 'name'
                for n in name:
                    like_cond = like_cond | Q(name__icontains=n)
                quatations_objs = quatations_objs.filter(like_cond)

        elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles:
            quatations_objs = Sale_order.objects.filter(company_id=company_id,create_by_user=user_id, module_type='QUOTATION').order_by('id')
            like_cond = Q()
            if len(filter_list) > 0:
                orderby = '-id'
                for f in filter_list:
                    like_cond = like_cond | Q(status__icontains=f)
                quatations_objs = quatations_objs.filter(like_cond)
            if len(name) > 0:
                orderby = 'name'
                for n in name:
                    like_cond = like_cond | Q(name__icontains=n)
                quatations_objs = quatations_objs.filter(like_cond)
            quatations_objs = quatations_objs.filter(like_cond)
        '''quatations_temp = Quotation_template.objects.filter(company_id=company_id, is_default=True)
        if len(quatations_temp) < 1:
            tmpl_obj = Quotation_template()
            tmpl_obj.name = 'Default Template'
            tmpl_obj.expiration_date = 30
            tmpl_obj.company_id = company_id
            tmpl_obj.user_id = user_id
            tmpl_obj.create_by = user_obj
            tmpl_obj.is_default = True
            tmpl_obj.save()'''

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
                    #order_date = o.order_date.strftime('%Y-%m-%d')
                    order_date = format_date(o.order_date, request.user.profile.company.currency)

                can_remove = False
                if o.status == 'draft' or o.status == 'cancel':
                    can_remove = True
                    status = o.status
                elif o.status == 'sale':
                    status = 'To Invoice'
                elif o.status == 'sent':
                    status = 'Quotation Sent'


                invoicing_objs = Customer_invoice.objects.filter(quotation_id=o.id)
                if invoicing_objs:
                    invoice_amount = decimal.Decimal(0.00)
                    for invoice in invoicing_objs:
                        invoice_amount = invoice_amount + invoice.total_amount
                        '''if invoice.invoice_status == 'all' or invoice.invoice_status == 'delivered' or invoice.invoice_status == 'email':
                            status = 'Invoiced'
                        elif invoice.invoice_status == 'fixed':
                            status = 'Partially invoiced'
                        '''

                    if invoice_amount > 0 and invoice_amount < o.amount_untaxed:
                        status = 'Partially invoiced'
                    elif invoice_amount == o.amount_untaxed or invoice_amount > o.amount_untaxed:
                        status = 'Invoiced'

                quatation_list.append({'id': o.id,
                                       'uuid':str(o.uuid),
                                       'user_id': o.create_by_user_id,
                                       'qt_num': o.name,
                                       'order_date': order_date,
                                       'customer': customer_name,
                                       'sales_person': 'Administrator',
                                       'total': utils.round_value(o.total_amount),
                                       'status': status.title(),
                                       'can_remove': can_remove
                                       })
                if o.total_amount is not None:
                    total_amount = total_amount + decimal.Decimal(o.total_amount)
    print("total_amount::", total_amount)
    data['currency'] = currency
    data['quatation_list'] = quatation_list;
    data['total_amount'] =   str(total_amount)

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
def preview(request, preview_id):
    return render(request, 'web/app.html')


def sales_pdf(request, encrypt_id ):
    data = {}
    data['success'] = False
    pdf_obj = Sale_order.objects.get(encrypt_id=encrypt_id)
    if pdf_obj:
        company_id = pdf_obj.company
        user_id = pdf_obj.create_by_user_id
        preview_id = pdf_obj.id
        pdf_obj_role = Profile.objects.filter(user_id=user_id)
        for pdf_ob_role in pdf_obj_role:
            roles = pdf_ob_role.roles
        currency_name = Company.objects.filter(id=company_id)
        for currency_name_ob in currency_name:
            if currency_name_ob.currency=='euro':
                currency = '€'
            else:
                currency = '$'
        context = getQuotationData(preview_id, company_id, user_id, roles, currency)
        #pdf = render_to_pdf('web/salers_order/home_page.html', context)
        return render(request, 'web/salers_order/home_page.html', context)
        if pdf:
            response = HttpResponse(pdf, content_type='application/pdf')
            filename = "%s.pdf" % (context['name'] + '_' + context['customer_name'])
            content = "inline; filename='%s'" % (filename)
            download = request.GET.get("download")
            if download:
                content = "attachment; filename='%s'" % (filename)
            response['Content-Disposition'] = content
            return response
        return HttpResponse("Not found")




@login_required(login_url="/login/")
def add(request):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def adddata(request):
    data = {}
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    customer = customers_objs
    data['success'] = True

    currency_name = Company.objects.filter(id=company_id)
    for currency_name_ob in currency_name:
        currency = currency_name_ob.currency

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    quatation_tmpl_list = getQoutTemplate(company_id, user_id, roles)
    if len(quatation_tmpl_list) > 0:
        data['json_quot_tmpl'] = quatation_tmpl_list

    json_products = getProduct(company_id, user_id, roles)
    if len(json_products) > 0:
        data['json_products'] = json_products

    json_taxes = getPorTaxes(company_id, user_id, roles)
    if len(json_taxes) > 0:
        data['json_taxes'] = json_taxes

    quat_temp = Quotation_template.objects.filter(company_id=company_id, is_default=True)
    for quat in quat_temp:
        data['selected_tmpl_id'] = quat.id
        data['selected_tmpl_name'] = quat.name

    product_taxes_temp = Product_taxes.objects.filter(company_id=company_id, is_default=True)
    if len(product_taxes_temp) < 1:
        tmpl_obj = Product_taxes()

        tmpl_obj.name = '20 % Taxes'
        tmpl_obj.value = 20
        tmpl_obj.computation = 'Percentage'
        tmpl_obj.scope = 'sale'
        tmpl_obj.company_id = company_id
        tmpl_obj.user_id = user_id
        tmpl_obj.create_by = user_obj
        tmpl_obj.is_default = True
        tmpl_obj.save()

    product_taxes_temp = Product_taxes.objects.filter(company_id=company_id, is_default=True)
    for tax in product_taxes_temp:
        data['tax_on_sale'] = tax.id
        data['tax_on_sale_name'] = tax.name

    json_uom = getUomlist(company_id, user_id, roles)
    if len(json_uom) > 0:
        data['json_uom'] = json_uom

    data['json_customer'] = customer
    data['currency'] = currency
    data['json_paytm'] = getPaymentTerms(company_id, user_id, roles)
    data['json_deli_mthd'] = getDeliveryMethods(company_id, user_id, roles)

    return HttpResponse(json.dumps(data), content_type="application/json")


def getPorTaxes(company_id, user_id, roles):
    taxes_list = []
    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        taxes_obj = Product_taxes.objects.filter(scope='sale', company_id=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        taxes_obj = Product_taxes.objects.filter(scope='sale', user_id=user_id)

    for o in taxes_obj:
        taxes_list.append({'id': o.id, 'name': o.name, 'value': str(o.value), 'computation': o.computation})

    return taxes_list


def getQoutTemplate(company_id, user_id, roles):
    qout_tmpl = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        tpml_obj = Quotation_template.objects.filter(company_id=company_id, is_deleted=False)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        tpml_obj = Quotation_template.objects.filter(create_by_user_id=user_id, is_deleted=False)

    if len(tpml_obj) > 0:
        for o in tpml_obj:
            qout_tmpl.append({'id': o.id, 'name': o.name})

    return qout_tmpl


def getPaymentTerms(company_id, user_id, roles):
    pt_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        pt_objs = Payment_term.objects.filter(company_id=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        pt_objs = Payment_term.objects.filter(create_by_user_id=user_id)

    for o in pt_objs:
        pt_list.append({'id': o.id, 'name': o.name})

    return pt_list


def getDeliveryMethods(company_id, user_id, roles):
    dm_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        dm_objs = Delivery_method.objects.filter(company_id=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        dm_objs = Delivery_method.objects.filter(create_by_user_id=user_id)

    for o in dm_objs:
        dm_list.append({'id': o.id, 'name': o.name})

    return dm_list


def getProduct(company_id, user_id, roles):
    product_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:
        product_objs = Product.objects.filter(product_tmpl__can_be_sold=1, company_id=company_id).exclude(
            status='down_payment').order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
        product_objs = Product.objects.filter(company_id=company_id, product_tmpl__can_be_sold=1, create_by_user_id=user_id).exclude(
            status='down_payment').order_by('id')

    for pro in product_objs:
        prodcut_name = ''
        if pro.template_name is not None:
            prodcut_name = pro.template_name
            product_list.append({'id': pro.id, 'name': prodcut_name, 'uuid':str(pro.uuid)})

    return product_list


def get_product_data(request):
    company_id = request.user.profile.company_id
    data = {}
    data['success'] = False
    pro_id = request.POST['id']
    user_obj = request.user
    user_id = user_obj.id

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    discription = ''
    sale_price = 0.00
    uom_id = ''
    uom_name = ''
    uom_category = ''
    tax_id = ''
    tax_name = ''
    tax_value =''
    tax_computation = ''

    product_obj = Product.objects.get(uuid=pro_id, company_id=company_id)

    if product_obj.product_tmpl is not None:
        if product_obj.product_tmpl.sale_price is not None:
            sale_price = product_obj.product_tmpl.sale_price

        if product_obj.product_tmpl.description is not None:
            discription = product_obj.product_tmpl.description

        if product_obj.product_tmpl.tax_on_sale is not None:
            tax_id = product_obj.product_tmpl.tax_on_sale_id
            tax_name = product_obj.product_tmpl.tax_on_sale.name
            tax_value = product_obj.product_tmpl.tax_on_sale.value
            tax_computation = product_obj.product_tmpl.tax_on_sale.computation

        if product_obj.product_tmpl.uofm is not None:
            uom_id = product_obj.product_tmpl.uofm.id
            uom_name = product_obj.product_tmpl.uofm.name

            if product_obj.product_tmpl.uofm.category is not None:
                uom_category = product_obj.product_tmpl.uofm.category.id

    '''json_uom = getUOMforProduct(uom_category, company_id)
    if len(json_uom) > 0:
        data['json_uom'] = json_uom

    json_products = getProduct(company_id, user_id, roles)
    if len(json_products) > 0:
        data['json_products'] = json_products

    json_taxes = getPorTaxes(company_id, user_id, roles)
    if len(json_taxes):
        data['json_taxes'] = json_taxes'''

    data['discription'] = discription
    data['sale_price'] = sale_price
    data['uom_id'] = uom_id
    data['uom_name'] = uom_name
    data['tax_id'] = tax_id
    data['tax_name'] = tax_name
    data['tax_value'] = str(tax_value)
    data['tax_computation'] = tax_computation
    data['uom_category'] = uom_category
    data['success'] = True


    return HttpResponse(json.dumps(data), content_type="application/json")


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
def save_quotation(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user

    json_data = json.loads(request.POST['fields'])
    sale_order_obj = Sale_order()

    sale_order_obj.company_id = company_id
    sale_order_obj.create_by_user = user_obj
    sale_order_obj.module_type = 'QUOTATION'
    sale_order_obj.status = 'sale'
    sale_order_obj.invoice_status = 'no'
    sale_order_obj.customer_order_reference = 'customer reference'

    if 'customer_id' in json_data and json_data['customer_id'] != '' and int(json_data['customer_id']) > 0:
        sale_order_obj.customer_id = int(json_data['customer_id'])

    if 'customer_name' in json_data and json_data['customer_name'] != '':
        sale_order_obj.customer_name = json_data['customer_name']

    if 'quot_tmpl' in json_data and json_data['quot_tmpl'] != '':
        sale_order_obj.qout_template_id = int(json_data['quot_tmpl'])

    if 'payment_term' in json_data and json_data['payment_term'] != '':
        sale_order_obj.payment_term_id = int(json_data['payment_term'])

    if 'delivery_method' in json_data and json_data['delivery_method'] != '':
        sale_order_obj.delivery_method_id = int(json_data['delivery_method'])

    if 'tax_amt' in json_data and json_data['tax_amt'] != '':
        sale_order_obj.tax_amount = float(round(json_data['tax_amt'],2))

    if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
        sale_order_obj.amount_untaxed = float(json_data['untaxed_amt'])
        if 'tax_amt' in json_data and json_data['tax_amt'] != '':
            sale_order_obj.total_amount = float(round(json_data['untaxed_amt'],2)) + float(round(json_data['tax_amt'],2))
        else:
            sale_order_obj.total_amount = float(json_data['untaxed_amt'])

    if 'optax_amt' in json_data and json_data['optax_amt'] != '':
        sale_order_obj.optax_amount = float(round(json_data['optax_amt'],2))

    if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
        sale_order_obj.opamount_untaxed = float(json_data['opuntaxed_amt'])
        if 'optax_amt' in json_data and json_data['optax_amt'] != '':
            sale_order_obj.optotal_amount = float(round(json_data['opuntaxed_amt'],2)) + float(round(json_data['optax_amt'],2))
        else:
            sale_order_obj.optotal_amount = float(round(json_data['opuntaxed_amt'],2))

    TODAY = datetime.today()
    mon_rel = relativedelta(months=1)
    expiration_date_else = TODAY + mon_rel

    if 'expexted_closing' in json_data and json_data['expexted_closing'] != '':
        sale_order_obj.expiration_date = datetime.strptime(json_data['expexted_closing'], "%m/%d/%Y")
    else:
        sale_order_obj.expiration_date = expiration_date_else

    if 'order_date' in json_data and json_data['order_date'] != '':
        sale_order_obj.order_date = datetime.strptime(json_data['order_date'], "%m/%d/%Y")
    else:
        sale_order_obj.order_date = datetime.today()

    if 'notes' in json_data:
        sale_order_obj.notes = json_data['notes']

    sale_order_obj.save()

    so_id = sale_order_obj.id
    customer_id = sale_order_obj.customer_id

    name = 'SO'

    if len(str(so_id)) == 1:
        name = name + '00' + str(so_id)
    elif len(str(so_id)) == 2:
        name = name + '0' + str(so_id)
    elif len(str(so_id)) > 2:
        name = name + str(so_id)

    sale_order_obj.name = name
    sale_order_obj.save()

    if so_id > 0:
        addProduct(json_data['products'], 'order', sale_order_obj, user_obj, company_id, customer_id)
        addProduct(json_data['optional_products'], 'optional', sale_order_obj, user_obj, company_id, customer_id)

    data['success'] = True
    data['id'] = so_id
    return HttpResponse(json.dumps(data), content_type="application/json")


# update quotation data
@login_required(login_url="/login/")
def update_quatation(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    json_data = json.loads(request.POST['fields'])
    if 'id' in json_data and json_data['id']:
        try:
            sale_order_obj = Sale_order.objects.get(uuid=json_data['id'], company_id=company_id)
            sale_order_obj.update_by_user = user_obj

            if 'customer_id' in json_data and json_data['customer_id'] != '' and int(json_data['customer_id']) > 0:
                sale_order_obj.customer_id = int(json_data['customer_id'])
            else:
                sale_order_obj.customer_id = None

            if 'customer_name' in json_data and json_data['customer_name'] != '':
                sale_order_obj.customer_name = json_data['customer_name']
            else:
                sale_order_obj.customer_name = None

            if 'payment_term' in json_data and json_data['payment_term'] != '':
                sale_order_obj.payment_term_id = int(json_data['payment_term'])
            else:
                sale_order_obj.payment_term_id = None

            if 'quot_tmpl' in json_data and json_data['quot_tmpl'] != '':
                sale_order_obj.qout_template_id = int(json_data['quot_tmpl'])
            else:
                sale_order_obj.qout_template_id = None

            if 'delivery_method' in json_data and json_data['delivery_method'] != '':
                sale_order_obj.delivery_method_id = int(json_data['delivery_method'])
            else:
                sale_order_obj.delivery_method_id = None

            if 'tax_amt' in json_data and json_data['tax_amt'] != '':
                sale_order_obj.tax_amount = float(round(json_data['tax_amt'],2))
            else:
                sale_order_obj.tax_amount = 0.00

            if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
                sale_order_obj.amount_untaxed = float(round(json_data['untaxed_amt'],2))
                if 'tax_amt' in json_data and json_data['tax_amt'] != '':
                    sale_order_obj.total_amount = float(round(json_data['untaxed_amt'],2)) + float(round(json_data['tax_amt'],2))
                else:
                    sale_order_obj.total_amount = float(round(json_data['untaxed_amt'],2))
            else:
                sale_order_obj.amount_untaxed = 0.00

            if 'optax_amt' in json_data and json_data['optax_amt'] != '':
                sale_order_obj.optax_amount = float(round(json_data['optax_amt'],2))
            else:
                sale_order_obj.tax_amount = 0.00

            if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
                sale_order_obj.opamount_untaxed = float(json_data['opuntaxed_amt'])
                if 'tax_amt' in json_data and json_data['optax_amt'] != '':
                    sale_order_obj.optotal_amount = float(round(json_data['opuntaxed_amt'],2)) + float(round(json_data['optax_amt'],2))
                else:
                    sale_order_obj.optotal_amount = float(round(json_data['opuntaxed_amt'],2))
            else:
                sale_order_obj.opamount_untaxed = 0.00

            if 'expexted_closing' in json_data and json_data['expexted_closing'] != '':
                sale_order_obj.expiration_date = datetime.strptime(json_data['expexted_closing'], "%m/%d/%Y")
            else:
                sale_order_obj.expiration_date = None

            if 'order_date' in json_data and json_data['order_date'] != '':
                sale_order_obj.order_date = datetime.strptime(json_data['order_date'], "%m/%d/%Y")
            else:
                sale_order_obj.order_date = datetime.today()

            if 'notes' in json_data:
                sale_order_obj.notes = json_data['notes']
            else:
                sale_order_obj.notes = None
            sale_order_obj.save()
            so_id = sale_order_obj.id
            customer_id = sale_order_obj.customer_id
            Sale_order_record.objects.filter(order=sale_order_obj).delete()
            if so_id > 0:
                addProduct(json_data['products'], 'order', sale_order_obj, user_obj, company_id, customer_id)
                addProduct(json_data['optional_products'], 'optional', sale_order_obj, user_obj, company_id,
                           customer_id)
            data['id'] = so_id
            data['uuid'] = str(sale_order_obj.uuid)
            data['success'] = True

        except Sale_order.DoesNotExist:
            data['success'] = False
    return HttpResponse(json.dumps(data), content_type='application/json')


def addProduct(products, line_type, so_obj, user_obj, company_id, customer_id):
    for pro in products:

        product_data = formatFields(pro['product_raw'])
        if product_data['pro_id'] is not None and product_data['pro_id'] != '':
            product = Product.objects.get(uuid=product_data['pro_id'], company_id=company_id)
            if product:
                so_record_obj = Sale_order_record()

                so_record_obj.order = so_obj
                so_record_obj.discription = product_data['pro_discription']
                so_record_obj.customer = customer_id
                so_record_obj.Product_id = product.id
                so_record_obj.company_id = company_id
                so_record_obj.create_by_user = user_obj
                so_record_obj.product_qty = product_data['pro_qty']
                so_record_obj.product_uom_id = int(product_data['pro_uom']) if product_data['pro_uom'] != '' else None
                so_record_obj.discount = float(product_data['pro_discount'])
                so_record_obj.unit_price = float(product_data['pro_up'])

                if line_type == 'order':
                    so_record_obj.Taxes_id = int(product_data['pro_tax']) if product_data['pro_tax'] != '' else None
                    so_record_obj.tax_price = float(product_data['record_tax'])
                    so_record_obj.price_subtotal = float(product_data['pro_subtotal'])
                    so_record_obj.price_total = float(product_data['pro_subtotal']) + float(product_data['record_tax'])

                elif line_type == 'optional':
                    so_record_obj.tax_price = float(product_data['record_tax'])
                    so_record_obj.price_subtotal = float(product_data['pro_subtotal'])
                    so_record_obj.price_total = float(product_data['pro_subtotal']) + float(product_data['record_tax'])

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
        uom_objs = Product_unit_of_measure.objects.filter(create_by_id=user_id, company_id=company_id)

    if len(uom_objs) > 0:
        for uom in uom_objs:
            uom_list.append({'id': uom.id, 'name': uom.name })
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


def viewdata(request, view_id):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    currency_name = Company.objects.filter(id=company_id)
    for currency_name_ob in currency_name:
        currency = currency_name_ob.currency

    op_id_list = getOpIdList(request, company_id, user_id, roles)
    if len(op_id_list) > 0:
        data['op_id_list'] = op_id_list
    text_invoice = []
    text_invoice12 = []
    quotation_data = getQuotationData(view_id, company_id, user_id, roles, currency)
    Invoicing_data = getInvoicingData(view_id)
    total_Invoicing_data = len(Invoicing_data)

    Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id=view_id)

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

    return HttpResponse(json.dumps(data), content_type='application/json')


def getInvoicingData(view_id):
    invoicing_list = []
    Invoicing_objs = Customer_invoice.objects.filter(quotation_id=view_id)
    for invoice in Invoicing_objs:
        invoicing_list.append({'id': invoice.id,
                               'invoice_status': invoice.invoice_status})

    return invoicing_list


def getOpIdList(request, company_id, user_id, roles):
    op_id_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(company_id=company_id, module_type=None).order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(create_by_user_id=user_id, module_type=None).order_by('id')

    for op in op_objs:
        op_id_list.append({'id': op.id})

    return op_id_list


def getOpIdListedit(request, company_id, user_id, roles):
    op_id_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(company_id=company_id, module_type=None).order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:

        op_objs = Sale_order.objects.filter(create_by_user_id=user_id, module_type=None).order_by('id')

    for op in op_objs:
        op_id_list.append({'id': op.id})

    return op_id_list


def getQuotationData(id, company_id, user_id, roles, currency):

    try:
        quatations_obj = Sale_order.objects.get(pk=int(id))

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
            profile_image1 = mainurl+profile_image
            address_street = contactp.street if contactp.street is not None else ''
            address_street2 = contactp.street2 if contactp.street2 is not None else ''
            address_city = contactp.city if contactp.city is not None else ''
            address_country = fields['Country'] if contactp.country is not None else ''
            address_zip = contactp.zip if contactp.zip is not None else ''
            address_json = address_street + ',' + address_street2 + ',' + address_city + ',' + address_country + ',' + address_zip
            mobile = fields['Mobile'] if fields['Mobile'] is not None else ''

        company_name = ''
        company_logo =None
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

        #user_detail = User.objects.filter(id=user_id)
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
        elif user_detail and user_detail.company.sales_term_and_condition:
            terms_conditions = user_detail.company.sales_term_and_condition

        expiration_date1 = ''
        if quatations_obj.expiration_date != "" and quatations_obj.expiration_date is not None:
            new_dt1 = str(quatations_obj.expiration_date);
            expiration_date1 = datetime.strptime(new_dt1, "%Y-%m-%d").strftime("%d/%m/%Y")
        else:
            expiration_date1 = None

        order_date1 = ''
        if quatations_obj.order_date != "" and quatations_obj.order_date is not None:
            new_dt2 = str(quatations_obj.order_date);
            order_date1 = datetime.strptime(new_dt2, "%Y-%m-%d").strftime("%d/%m/%Y")
        else:
            order_date1 = None

        quotation_dict = {
            'id': quatations_obj.id,
            'user_id': quatations_obj.create_by_user_id,
            'name': quatations_obj.name,
            'firstname': firstname,
            'lastname': lastname,
            'company_name': company_name,
            'company_logo': company_logo,
            'mobile' : mobile,
			'phone' 	: phone,
			'email' : email,
			'currency' : currency,
            'url'      :quatations_obj.encrypt_id,
			'company_billing_company_name' :company_billing_company_name,
            'company_address_billing_street': company_address_billing_street,
            'company_address_billing_city': company_address_billing_city,
            'company_address_billing_country': company_address_billing_country,
            'company_address_billing_zip': company_address_billing_zip,
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
            'sales_person_id': quatations_obj.sales_person,
            'opportunity_id': quatations_obj.opportunity_id,
            'customer_invoice_id': quatations_obj.customer_invoice_id,
            'notes': terms_conditions,
            'customer_order_reference': quatations_obj.customer_order_reference,
            'expiration_date': str(quatations_obj.expiration_date),
            'order_date': str(quatations_obj.order_date),
            'expiration_date1': expiration_date1,
            'order_date1': order_date1,
            'qout_tmpl_id': quot_tmpl_id,
            'qout_tmpl_name': quot_tmpl_name,
            'payment_term': payment_term_id,
            'pay_tm_name': pay_tm_name,
            'delivery_method_id': dm_id,
            'delivery_method_name': dm_name,
            'amount_untaxed': quatations_obj.amount_untaxed,
            'tax_amount': quatations_obj.tax_amount,
            'total_amount': quatations_obj.total_amount,
            'opamount_untaxed': quatations_obj.opamount_untaxed,
            'optax_amount': quatations_obj.optax_amount,
            'optotal_amount': quatations_obj.optotal_amount,
            'status': quatations_obj.status,
            'invoice_status': quatations_obj.invoice_status,
            'legacy_information': legacy_information
        }

        print("quotation_dict",quotation_dict)

        quotation_dict['products'] = getQuotationProduct(quatations_obj.id, 'order', company_id, user_id, roles)
        quotation_dict['optional_products'] = getQuotationProduct(quatations_obj.id, 'optional', company_id, user_id,
                                                                  roles)
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
    # print("contact_tabs",contact_tabs.query)
    if contact_tabs is not None:
        for o in contact_tabs:
            tab_dic = {'tab_id': o.id, 'tab_name': o.name, 'is_default': o.is_default, 'fields': []}
            field_ids = ', '.join([str(x) for x in o.fields])
            contact_fields = ContactFieldsValue.contact_field_value_data(contact_id, field_ids)
            # print("contact_fields", contact_fields.query)
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
    pro_record_list = []
    s_o_r_dict = Sale_order_record.objects.filter(order_id=id, line_type=line_type, company_id=company_id).order_by('id')

    if len(s_o_r_dict) > 0:
        for o in s_o_r_dict:

            uom_name = ''
            product_name = 'Product Deleted'
            tax_id = ''
            tax_name = ''
            json_uom = []
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

            json_taxes = getPorTaxes(company_id, user_id, roles)

            pro_record_list.append({
                'id': o.id,
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
                'unit_price': o.unit_price,
                'tax_price': o.tax_price,
                'price_subtotal': o.price_subtotal,
                'price_total': o.price_total,
                'price_reduce': o.price_reduce,
                'discount': o.discount,
                'json_uom': json_uom,

            })

    return pro_record_list


def getCustomerNameByID(id):
    customer_name = ''
    customer = customers_objs

    for o in customer:
        if id == o['id']:
            customer_name = o['name']

    return customer_name


@login_required(login_url="/login/")
def edit(request, edit_id, status=None):
    return render(request, 'web/app.html')


def editdata(request, edit_id):
    print("Sales order editdata")
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    customer = customers_objs
    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    text_invoice = []
    text_invoice12 = []

    currency_name = Company.objects.filter(id=company_id)
    for currency_name_ob in currency_name:
        currency = currency_name_ob.currency

    quatation_tmpl_list = getQoutTemplate(company_id, user_id, roles)
    if len(quatation_tmpl_list) > 0:
        data['json_quot_tmpl'] = quatation_tmpl_list

    json_products = getProduct(company_id, user_id, roles)
    if len(json_products) > 0:
        data['json_products'] = json_products

    json_uom = getUomlist(company_id, user_id, roles)
    if len(json_uom) > 0:
        data['json_uom'] = json_uom

    json_taxes = getPorTaxes(company_id, user_id, roles)
    if len(json_taxes) > 0:
        data['json_taxes'] = json_taxes

    data['json_customer'] = customer
    data['json_paytm'] = getPaymentTerms(company_id, user_id, roles)
    data['json_deli_mthd'] = getDeliveryMethods(company_id, user_id, roles)

    op_id_list = getOpIdListedit(request, company_id, user_id, roles)
    if len(op_id_list) > 0:
        data['op_id_list'] = op_id_list

    Invoicing_data = getInvoicingData(edit_id)
    total_Invoicing_data = len(Invoicing_data)

    Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id=edit_id, company_id=company_id)

    for invoice1 in Invoicing_objs1:

        text_invoice.append(invoice1.invoice_status)
        if 'all' in text_invoice or 'delivered' in text_invoice:
            text_invoice12 = 'YES'
        else:
            text_invoice12 = 'NO'
    quotation_data = getQuotationData(edit_id, company_id, user_id, roles, currency)
    if quotation_data is not None:
        data['quotation'] = quotation_data
        data['Invoicing'] = Invoicing_data
        data['text_invoice'] = text_invoice
        data['text_invoice12'] = text_invoice12
        data['total_Invoicing_data'] = total_Invoicing_data
        data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def getTemplateDataByID(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    tmpl_id = request.POST['id']

    qt = Quotation_template.objects.get(pk=tmpl_id, company_id=company_id)

    expiration_date3 = qt.expiration_date
    TODAY = date.today()
    mon_rel = relativedelta(days=expiration_date3)
    expiration_date_else = TODAY + mon_rel
    terms_and_codition = qt.terms_and_codition
    expiration_date = str(expiration_date_else)
    data['expiration_date'] = datetime.strptime(expiration_date, "%Y-%m-%d").strftime("%m/%d/%Y")
    data['terms_and_codition'] = terms_and_codition
    products = getTeamplteProduct(int(tmpl_id), 'order', company_id, user_id, roles)
    optionals = getTeamplteProduct(int(tmpl_id), 'optional', company_id, user_id, roles)

    data['products'] = products
    data['optionals'] = optionals

    data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def getTeamplteProduct(id, line_type, company_id, user_id, roles):
    pro_record_list = []
    q_t_r_dict = Quotation_template_record.objects.filter(quotation_template_id=id, line_type=line_type, company_id=company_id).order_by('id')

    if len(q_t_r_dict) > 0:
        for o in q_t_r_dict:
            uom_name = ''
            tax_id = ''
            tax_name = ''
            json_uom = []
            if o.product_uom is not None:
                uom_name = o.product_uom.name
                if o.product_uom.category_id is not None:
                    json_uom = getUOMforProduct(o.product_uom.category_id, company_id)

            product_name = o.Product.template_name if o.Product.template_name is not None else ''
            json_taxes = getPorTaxes(company_id, user_id, roles)

            if o.Taxes is not None:
                tax_name = o.Taxes.name
            pro_record_list.append({
                'id': o.id,
                'Product': o.Product_id,
                'product_name': product_name,
                'product_description': o.discription,
                'product_qty': o.product_qty,
                'product_up': o.unit_price,
                'product_uom': o.product_uom_id,
                'product_uom_name': uom_name,
                'product_tax_id': o.Taxes_id,
                'product_tax_name': tax_name,
                'discount': o.discount,
                'json_uom': json_uom,
                'json_taxes': json_taxes
            })
    return pro_record_list


def updateQuotStatus(request):
    print("Hello updateQuotStatus")
    data = {}
    company_id = request.user.profile.company_id
    data['success'] = False
    status = request.POST['status']
    quot_id = request.POST['q_id']
    try:
        qout_obj = Sale_order.objects.get(uuid=quot_id, company_id=company_id)
        qout_obj.status = status
        qout_obj.save()
        data['success'] = True
    except Sale_order.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type='application/json')


def upload_file(request):
    utils = Utils
    print('helllooo')
    response = {'success': False, 'file_name': '', 'file_path': ''}
    file_path = 'media/email'
    if request.method == 'POST' and request.FILES['ufile']:
        myfile = request.FILES['ufile']
        fs = FileSystemStorage(location='media/email/')
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = '/' + file_path + '/' + filename
        response = {'success': True, 'file_name': filename, 'file_path': uploaded_file_url}
    return HttpResponse(json.dumps(response), content_type="application/json")


def upload_file1(request):
    utils = Utils
    response = {'success': False, 'file_name': '', 'file_path': ''}
    file_path = 'media/email'
    if request.method == 'POST' and request.FILES['ufile1']:
        myfile = request.FILES['ufile1']
        fs = FileSystemStorage(location='media/email/')
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = '/' + file_path + '/' + filename
        response = {'success': True, 'file_name': filename, 'file_path': uploaded_file_url}
    return HttpResponse(json.dumps(response), content_type="application/json")


def getEmailData(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id

    email_template_objs = EmailTemplate.objects.filter(company_id=company_id, is_deleted=False)

    if len(email_template_objs) > 0:
        for x in email_template_objs[:1]:
            ename = ''
            eid = ''
            esubject = ''
            edescription = ''

            if x.name is not None:
                ename = x.name
            if x.id is not None:
                eid = x.id
            if x.subject is not None:
                esubject = x.subject
            if x.description is not None:
                edescription = x.description
            data['id'] = eid
            if len(ename) > 0:
                data['name'] = ename

            if len(esubject) > 0:
                data['subject'] = esubject
            if len(edescription) > 0:
                data['description'] = edescription

    recipients_json = getRecipients(company_id)
    if len(recipients_json) > 0:
        data['recipients_json'] = recipients_json

    email_template_json = getEmailTemplate(request)
    if len(email_template_json) > 0:
        data['email_template_json'] = email_template_json

    data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')




def getEmailTemplateData(request, email_template_id):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id

    email_template_objs = EmailTemplate.objects.get(id=email_template_id, company_id=company_id)

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


def getEmailTemplate(request, module_type):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id

    com_list = []
    email_template_objs = EmailTemplate.objects.filter(company_id=company_id, is_deleted=False,
                                                       module_type=module_type).order_by('name')
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
            #
            name = ''
            if com.name is not None:
                name = com.name

            com_list.append({'id': com.id, 'name': com.name, 'subject': com.subject, 'description': com.description,
                             'image_path': com.image_path})

    if len(com_list) > 0:
        data['email_template_json'] = com_list

    data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def generate_pdf(pk):
    y = 700
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont('Helvetica', 10)
    p.drawString(220, y, "PDF generate at " + timezone.now().strftime('%Y-%b-%d'))
    p.showPage()
    p.save()
    pdf = buffer.getvalue()
    buffer.close()
    return pdf


def sendQuoteEmail(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    fields = json.loads(request.POST['fields'])
    quotationID = fields['quotationID']

    pdf_url = settings.HOST_NAME_WITHOUT_SLASH + fields['pdf_url']
    qname = fields['qname']
    customer = fields['customer']
    r = requests.get(pdf_url, stream=True)
    pdf_file_name = qname +'.pdf'
    pdf_file_path = settings.BASE_DIR+'/media/'+str(company_id)+'/'+pdf_file_name
    if not os.path.exists(os.path.dirname(pdf_file_path)):
        try:
            os.makedirs(os.path.dirname(pdf_file_path))
        except OSError as exc:  # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise
    print("pdf_file_path", pdf_file_path)
    with open(pdf_file_path, 'wb') as fd:
        for chunk in r.iter_content(2000):
            fd.write(chunk)

    recipt_str = fields['recipients']
    recipt_str1 = fields['recipients1']

    recipt_id_list = recipt_str.split(",")
    recipients_arr = recipt_str1.split(",")
    From = 'crm@sitenco.com'
    msgdata = fields['content']
    subject = fields['subject']
    text_content = "k"

    attachment1 = fields['attachements']

    if len(recipt_id_list) > 0:
        email_list = get_customer_by_id_list(recipt_id_list)
        for recipients_arr1 in recipients_arr:
            email_list.append({'email_list': recipients_arr1})
        for x in email_list:
            email_list = x['email_list']

            if email_list != '' and email_list != None:
                result = EmailMultiAlternatives(subject, text_content, From, [email_list])
                result.attach_alternative(msgdata, "text/html")
                result.attach_file(pdf_file_path)
                for attachment2 in attachment1:
                    attachment = 'media/email/' + attachment2
                    result.attach_file(attachment)
                result.send()
                data['success'] = True
            else:
                data['success'] = True
        data['success'] = True
    else:
        data['success'] = False

    return HttpResponse(json.dumps(data), content_type='application/json')


def saveEmailtemplate(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id

    fields = json.loads(request.POST['fields'])

    if 'id' in fields and int(fields['id']) > 0:

        email_template_obj = EmailTemplate.objects.get(id=int(fields['id']))

        email_template_obj.name = fields['name']
        email_template_obj.description = fields['content']
        email_template_obj.subject = fields['subject']
        email_template_obj.image_path = '|'.join(fields['attachements'])
        email_template_obj.company_id = company_id
        email_template_obj.save()
    else:

        email_template_obj = EmailTemplate()
        email_template_obj.name = fields['name']
        email_template_obj.description = fields['content']
        email_template_obj.image_path = '|'.join(fields['attachements'])
        email_template_obj.subject = fields['subject']
        email_template_obj.module_type = fields['module_type']
        email_template_obj.company_id = company_id
        email_template_obj.save()

    data['id'] = email_template_obj.id
    data['name'] = email_template_obj.name
    data['subject'] = email_template_obj.subject
    data['description'] = email_template_obj.description
    data['success'] = True
    return HttpResponse(json.dumps(data), content_type='application/json')


def getCustomerEmailAddr(id_list, user_id):
    email_list = []
    contact_field_valuet = ContactFieldsValue.objects.select_related('contact', 'contact_field').all()
    contact_field_value = contact_field_valuet.filter(user_id=user_id).filter(contact_id__in=(id_list))
    for ct in contact_field_value:
        if ct.contact_field.name == "email" and ct.contact_field.is_default:
            email_list.append({'email_list': ct.contact_field_value})
    return email_list


def deleteQoutation(request):
    data = {}
    data['success'] = False

    id_list = json.loads(request.POST['ids'])

    if len(id_list) > 0:
        for i in id_list:
            try:
                quot_obj = Sale_order.objects.get(pk=int(i)).delete()
            except quot_obj.DoesNotExist:
                pass

        data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def CreateInvoice(request):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id

    fields = json.loads(request.POST['fields'])

    invoice_obj = Customer_invoice()
    invoice_obj.customer_id = fields['customer_id']
    invoice_obj.customer_name = fields['customer_name']
    invoice_obj.invoice_date = fields['invoice_date']
    invoice_obj.due_date = fields['due_date']
    invoice_obj.sales_person = fields['sales_person']
    invoice_obj.quotation_name = fields['quotation_name']
    invoice_obj.status = fields['status']
    invoice_obj.total_amount = fields['total_amount']
    invoice_obj.amount_due = fields['amount_due']
    invoice_obj.save()

    inv_id = invoice_obj.id
    name = 'INV/2017/'

    if len(str(inv_id)) == 1:
        name = name + '00' + str(inv_id)
    elif len(str(inv_id)) == 2:
        name = name + '0' + str(inv_id)
    elif len(str(inv_id)) > 2:
        name = name + str(inv_id)

    invoice_obj.name = name
    invoice_obj.save()


def salersexport(request):
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
                    name = '-'

                if o.customer_name is not None and o.customer_name != '':

                    customer_name = o.customer_name
                else:
                    customer_name = '-'

                if o.order_date is not None and o.order_date != '':

                    order_date = o.order_date.strftime('%d-%m-%Y')
                else:
                    order_date = '-'

                if o.total_amount is not None and o.total_amount != '':
                    total_amount = str(o.total_amount)
                else:
                    total_amount = '-'

                if o.status is not None and o.status != '':
                    status = 'To Invoice'
                    Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id=o.id)
                    for invoice1 in Invoicing_objs1:
                        if invoice1.invoice_status == 'all' or invoice1.invoice_status == 'delivered':
                            status = 'Nothing Invoice'
                else:
                    status = 'To Invoice'

                list_dic.append({
                    'Sales Order Number': name,
                    'Order Date': order_date,
                    'Customer Name': customer_name,
                    'Total': total_amount,
                    'Status': status,
                })

    if list_dic:
        to_csv = list_dic
        keys1 = to_csv[0].keys()
        keys = (['Sales Order Number', 'Order Date', 'Customer Name', 'Total', 'Status'])
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

