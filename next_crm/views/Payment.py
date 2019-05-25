from django.shortcuts import render
from django.http import HttpResponse
from datetime import time
from django.contrib.auth.decorators import login_required
from django.conf import settings
import json
import os
from django.db.models import Q
from next_crm.models import Sale_order,Email_reminder,Payment_register,Company,Customer_invoice,Profile,Sale_order_record, Product_taxes, Quotation_template, Quotation_template_record, Payment_term,Term, Delivery_method
import time
import csv

customers_objs = [{"name":"Delta Pc", "id":1, "email":"example1@gmail.com" },{"name":"Orman GT", "id":2, "email":"example2@gmail.com"},{"name":"Pecho Dy", "id":3, "email":"example3@gmail.com"}]

@login_required(login_url="/login/")
def list(request,id=''):
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def listdata(request):
	data         = {}
	company_id   = request.user.profile.company_id
	user_obj     = request.user
	user_id      = user_obj.id
	total_amount   = 0
	Payment_list = []
	
	currency_name = Company.objects.filter(id = company_id)
	for currency_name_ob in currency_name:
		currency = currency_name_ob.currency

	limit  = settings.PAGGING_LIMIT
	offset = ""

	if request.method=="POST":
		json_data = json.loads(request.POST['fields'])
		parameter = formatFields(json_data)

		dic_name 			= json.loads(request.POST['names'])
		dic_total 			= json.loads(request.POST['total_amount'])
		dic_customer 		= json.loads(request.POST['customer'])
		query = Q()
		total = Q()
		customer = Q()

		offset = int(parameter['offset'])
		limit = offset+int(limit)

		orderby = '-id'

		Payment = Payment_register.objects.filter(company = company_id)

		like_cond = Q()

		if len(dic_name) > 0:
			for name in dic_name:
				query = query | Q(name__icontains=name)
			Payment = Payment.filter(query)

		if len(dic_total) > 0:
			for totale in dic_total:
				total = total | Q(payment_amount__icontains=totale)
			Payment = Payment.filter(total)

		if len(dic_customer) > 0:
			for customers in dic_customer:
				customer = customer | Q(customer_name__icontains=customers)
			Payment = Payment.filter(customer)

		total_unit = len(Payment)

		Payment = Payment.order_by(orderby)
		Payment = Payment[offset:limit]

		data['total_count'] = total_unit

		if len(Payment)>0:
			for o in Payment:
				payment_date = o.payment_date.strftime('%d-%m-%Y')

				can_remove = True;

				Payment_list.append({'id' :o.id,
					'customer' :o.customer_name,
					'payment_date' :payment_date,
					'name' :o.name,
					'payment_journal' :o.payment_journal,
					'payment_method_type' :o.payment_method_type,
					'payment_amount' :o.total_payment_amount,
					'status' :o.status,
					'can_remove' :can_remove,
					})

				if o.payment_amount is not None:
					total_amount = total_amount + float(o.payment_amount)

	data['currency']       	= currency
	data['Payment_list'] 		= Payment_list
	data['total_amount']   	= total_amount

	return HttpResponse(json.dumps(data), content_type="application/json")

@login_required(login_url="/login/")
def add(request):
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def adddata(request):
	data = {}
	company_id   	= request.user.profile.company_id
	user_obj     	= request.user
	user_id       	= user_obj.id
	customer     	= customers_objs
	data['success']      = True

	currency_name = Company.objects.filter(id = company_id)
	for currency_name_ob in currency_name:
		currency = currency_name_ob.currency
	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"

	quatation_tmpl_list  = getQoutTemplate(company_id,user_id,roles)
	if len(quatation_tmpl_list)>0:	
		data['json_quot_tmpl'] = quatation_tmpl_list	

	json_products = getProduct(company_id,user_id,roles)
	if len(json_products)>0:
		data['json_products'] = json_products 

	json_taxes = getPorTaxes(company_id,user_id,roles)
	if len(json_taxes)>0:
		data['json_taxes'] = json_taxes

	quat_temp = Quotation_template.objects.filter(company = company_id,Is_Default = 1)
	for quat in quat_temp:

		data['selected_tmpl_id'] = quat.id
		data['selected_tmpl_name'] = quat.name
		
	product_taxes_temp = Product_taxes.objects.filter(company = company_id,Is_Default = 1)
	if len(product_taxes_temp)<1:
		tmpl_obj = Product_taxes()

		tmpl_obj.name            = '20 % Taxes'
		tmpl_obj.value           =  20
		tmpl_obj.computation     = 'Percentage'
		tmpl_obj.scope           = 'sale'
		tmpl_obj.company         = company_id
		tmpl_obj.user_id            = user_id
		tmpl_obj.create_by       = user_obj
		tmpl_obj.Is_Default      = 1
		tmpl_obj.save()

	product_taxes_temp = Product_taxes.objects.filter(company = company_id,Is_Default = 1)
	for tax in product_taxes_temp:

		data['tax_on_sale'] = tax.id
		data['tax_on_sale_name'] = tax.name

	json_uom = getUomlist(company_id,user_id,roles)
	if len(json_uom)>0:
		data['json_uom'] = json_uom 

	data['json_customer']   = customer
	data['currency']  		= currency 
	data['json_paytm']      = getPaymentTerms(company_id,user_id,roles)
	data['json_deli_mthd']  = getDeliveryMethods(company_id,user_id,roles) 
	
	return HttpResponse(json.dumps(data), content_type="application/json")

@login_required(login_url="/login/")
def view(request, view_id):
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def viewdata(request, view_id):
	data = {}
	data['success'] = False

	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id         = user_obj.id

	currency_name = Company.objects.filter(id = company_id)
	for currency_name_ob in currency_name:
		currency = currency_name_ob.currency

	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"

	op_id_list = getOpIdList(request , company_id , user_id , roles)
	if len(op_id_list)>0:
		data['op_id_list'] = op_id_list
	text_invoice=[]
	text_invoice12=[]
	quotation_data = getQuotationData(view_id, company_id,user_id,roles,currency)
	Invoicing_data = getInvoicingData(view_id)
	total_Invoicing_data     = len(Invoicing_data)

	Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id = view_id)

	for invoice1 in Invoicing_objs1:

		text_invoice.append(invoice1.invoice_status)
		if 'all' in text_invoice or 'delivered' in text_invoice:
			text_invoice12 ='YES'
		else:
			text_invoice12 ='NO'



	if quotation_data is not None:
		data['quotation'] = quotation_data
		data['Invoicing'] = Invoicing_data
		data['text_invoice'] = text_invoice
		data['text_invoice12'] = text_invoice12
		data['total_Invoicing_data'] = total_Invoicing_data
		data['user_id'] = user_id
		data['success'] = True

	return HttpResponse(json.dumps(data), content_type = 'application/json')

@login_required(login_url="/login/")
def edit(request, edit_id, status=None):
	return render(request, 'web/app.html')

def editdata(request, edit_id):
	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id         = user_obj.id
	customer        = customers_objs
	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"

	text_invoice=[]
	text_invoice12=[]
	currency_name = Company.objects.filter(id = company_id)
	for currency_name_ob in currency_name:
		currency = currency_name_ob.currency
	quatation_tmpl_list  = getQoutTemplate(company_id,user_id,roles)
	if len(quatation_tmpl_list)>0:	
		data['json_quot_tmpl'] = quatation_tmpl_list

	json_products = getProduct(company_id,user_id,roles)
	if len(json_products)>0:
		data['json_products'] = json_products 

	json_uom = getUomlist(company_id,user_id,roles)
	if len(json_uom)>0:
		data['json_uom'] = json_uom 
	
	json_taxes = getPorTaxes(company_id,user_id,roles)
	if len(json_taxes)>0:
		data['json_taxes'] = json_taxes

	data['json_customer']  = customer  
	data['json_paytm']     = getPaymentTerms(company_id,user_id,roles)
	data['json_deli_mthd'] = getDeliveryMethods(company_id,user_id,roles)

	op_id_list = getOpIdListedit(request , company_id , user_id , roles)
	if len(op_id_list)>0:
		data['op_id_list'] = op_id_list

	Invoicing_data = getInvoicingData(edit_id)
	total_Invoicing_data     = len(Invoicing_data)

	Invoicing_objs1 = Customer_invoice.objects.filter(quotation_id = edit_id)

	for invoice1 in Invoicing_objs1:

		text_invoice.append(invoice1.invoice_status)
		if 'all' in text_invoice or 'delivered' in text_invoice:
			text_invoice12 ='YES'
		else:
			text_invoice12 ='NO'
	quotation_data = getQuotationData(edit_id,company_id,user_id,roles,currency)
	if quotation_data is not None:
		data['quotation'] = quotation_data 
		data['Invoicing'] = Invoicing_data
		data['text_invoice'] = text_invoice
		data['text_invoice12'] = text_invoice12
		data['total_Invoicing_data'] = total_Invoicing_data
		data['success'] = True

	return HttpResponse(json.dumps(data), content_type = 'application/json')


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields 

def deletePayment(request):
	data = {}
	data['success'] = False

	id_list  = json.loads(request.POST['ids'])

	if len(id_list)>0:
		for i in id_list:
			try:
				quot_obj = Payment_register.objects.get(pk=int(i)).delete()
			except quot_obj.DoesNotExist:
				pass

		data['success'] = True

	return HttpResponse(json.dumps(data), content_type= 'application/json')

def paymentexport(request):

    export_status = {'success':False}
    id_list  = json.loads(request.POST['ids'])
    list_dic =[]
    data 		=[]
    if len(id_list)>0:
    	for i in id_list:
    		quot_obj = Payment_register.objects.filter(pk=int(i))
    		for o in quot_obj:

    			if o.name is not None and o.name !='':
    				
    				name = o.name
    			else:
    				name = ''    			

    			if o.customer_name is not None and o.customer_name !='':
    				
    				customer_name = o.customer_name
    			else:
    				customer_name =''  			

    			if o.payment_date is not None and o.payment_date !='':
    				
    				payment_date = o.payment_date.strftime('%d-%m-%Y')
    			else:
    				payment_date = ''
		

    			if o.payment_amount is not None and o.payment_amount !='':
    				payment_amount = str(o.payment_amount)
    			else:
    				payment_amount = ''     						

    			if o.status is not None and o.status !='':
    				status = o.status
    			else:
    				status = ''    			

    			if o.payment_journal is not None and o.payment_journal !='':
    				payment_journal = str(o.payment_journal)
    			else:
    				payment_journal = ''     						

    			if o.payment_method_type is not None and o.payment_method_type !='':
    				payment_method_type = o.payment_method_type
    			else:
    				payment_method_type = ''

	    		list_dic.append({
			            'Payment Date'	:payment_date,
			            'Name'	:name, 		            
			            'Payment Journal'	:payment_journal,
			            'Payment Method Type'	:payment_method_type, 
			            'Customer Name'	:customer_name,        
			            'Payment Amount':payment_amount,
			            'Status':status,
					})

    if list_dic:
    	to_csv = list_dic
    	keys1 = to_csv[0].keys()
    	keys = (['Payment Date','Name','Payment Journal','Payment Method Type','Customer Name','Payment Amount', 'Status'])
    	file_path = 'media/user_csv/' + str(request.user.id)
    	file_name = time.strftime("%Y%m%d-%H%M%S") + '.csv'
    	if not os.path.exists(file_path):
    		os.makedirs(file_path)
    	uploaded_file_url =  file_path + '/' + file_name
    	with open(uploaded_file_url, 'w', encoding="latin-1", newline='') as fp:
    		dict_writer = csv.DictWriter(fp, keys)
    		dict_writer.writeheader()

    		for dic in list_dic:
		        keys, values = zip(*dic.items())
		        
		        dict_writer.writerow(dict(zip(keys, values)))

    	export_status = {'success': True, 'file':uploaded_file_url}

    return HttpResponse(json.dumps(export_status), content_type="application/json")