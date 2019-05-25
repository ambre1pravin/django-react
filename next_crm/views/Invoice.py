from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from datetime import datetime
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.template.loader import get_template
import json
from django.db.models import Q
from next_crm.models import  Sale_order,ContactTab, Sale_order_record,Contact,ContactFieldsValue, Product, Product_unit_of_measure, \
	Product_taxes, Quotation_template, Quotation_template_record, Payment_term, Delivery_method, Messages, AttachDocument


customers_objs = [{"name":"Delta Pc", "id":1, "email":"example1@gmail.com" },{"name":"Orman GT", "id":2, "email":"example2@gmail.com"},{"name":"Pecho Dy", "id":3, "email":"example3@gmail.com"}]

@login_required(login_url="/login/")
def list(request):
	#return render(request, 'web/invoice/invoice_app.html')
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def edit(request, edit_id, status=None):
	#return render(request, 'web/invoice/invoice_app.html')
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def view(request, view_id):
	#return render(request, 'web/invoice/invoice_app.html')
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def add(request):
	#return render(request, 'web/invoice/invoice_app.html')
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def preview(request, preview_id):
	#return render(request, 'web/invoice/invoice_app.html')
	return render(request, 'web/app.html')

@login_required(login_url="/login/")
def listdata(request):

	data           = {}
	company_id     = request.user.profile.company_id
	quatation_list = []
	total_amount   = 0
	user_obj      = request.user
	user_id       = user_obj.id
	customer_list  = customers_objs  #defined at top
	
	limit  = ""
	offset = ""
	Is_Default=[]

	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"

	if request.method=="POST":

		json_data = json.loads(request.POST['fields'])
		parameter = formatFields(json_data)

		name = json.loads(request.POST['names'])

		offset  = int(parameter['offset'])
		limit   = offset+int(parameter['limit'])

		orderby = "-id"

		if 'ROLE_MANAGE_ALL_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
			# print('ifff')
			quatations_objs = Sale_order.objects.filter(company = company_id, module_type ='invoice')
			like_cond = Q()

			if len(name)>0:
				orderby = 'name'
				for n in name:
					like_cond = like_cond | Q(name__icontains = n)

				quatations_objs = quatations_objs.filter(like_cond)

		elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles:
			# print('else')
			quatations_objs = Sale_order.objects.filter(create_by_user = user_id, module_type ='invoice')
			like_cond = Q()

			if len(name)>0:
				orderby = 'name'
				for n in name:
					like_cond = like_cond | Q(name__icontains = n)
				


				quatations_objs = quatations_objs.filter(like_cond)

		quatations_temp = Quotation_template.objects.filter(company = company_id, Is_Default = 1)
		if len(quatations_temp)<1:
			tmpl_obj = Quotation_template()
			tmpl_obj.name = 'Default Template'
			tmpl_obj.company = company_id
			tmpl_obj.Is_Default = 1
			tmpl_obj.save()
		total_quots     = len(quatations_objs)
		quatations_objs = quatations_objs.order_by(orderby)
		quatations_objs = quatations_objs[offset:limit]

		data['total_count'] = total_quots

		if len(quatations_objs)>0:
			for o in quatations_objs:
				order_date = None
				customer_name = None
				if o.customer_id is not None:
					customer_name = o.customer_name 

				if o.order_date is not None:
					order_date = o.order_date.strftime('%Y-%m-%d %H:%M:%S')

				status = getQoutationStatus(o.status)

				can_remove = False;
				if o.status=='draft' or o.status=='cancel':
					can_remove = True

				quatation_list.append({'id' :o.id,
									'user_id' : o.create_by_user_id,
									'qt_num' :o.name,
									'order_date' :order_date,
									'customer' :customer_name,
									'sales_person' :'Administrator',
									'total' :o.total_amount,
									'status' :status, 
									'can_remove' :can_remove

				})
				if o.total_amount is not None:
					total_amount = total_amount + int(o.total_amount)


	data['quatation_list'] = quatation_list;
	data['quatation_list'] = quatation_list;  
	data['total_amount']   = total_amount

	return HttpResponse(json.dumps(data), content_type="application/json")


def getQoutationStatus(status):
	status_dict = {
		'draft'  : 'Quotation',
		'sent'   : 'Quotation Sent',
		'sale'   : 'Sales Order',
		'cancel' : 'Cancelled',
		'To Invoice' :'To Invoice',
	}

	return status_dict.get(status , 'Quotation')

def pdf_download(request,preview_id):
	template = get_template('web/invoice/home_page.html')
	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id         = user_obj.id
	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"
	context = getQuotationData(preview_id, company_id,user_id,roles)

	#pdf =  render_to_pdf('web/invoice/home_page.html', context)
	return render('web/invoice/home_page.html', context)



@login_required(login_url="/login/")
def adddata(request):
	data = {}
	company_id   = request.user.profile.company_id
	user_obj     = request.user
	user_id       = user_obj.id
	customer     = customers_objs

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


	json_uom = getUomlist(company_id,user_id,roles)
	if len(json_uom)>0:
		data['json_uom'] = json_uom 

	data['json_customer']  = customer 
	data['json_paytm']     = getPaymentTerms(company_id,user_id,roles)
	data['json_deli_mthd'] = getDeliveryMethods(company_id,user_id,roles) 
	
	return HttpResponse(json.dumps(data), content_type="application/json")

def getPorTaxes(company_id,user_id,roles):

	taxes_list = []
	if 'ROLE_MANAGE_ALL_QUOTATION' in roles :
		taxes_obj = Product_taxes.objects.filter(scope = 'sale', company = company_id)

	elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
		taxes_obj = Product_taxes.objects.filter(scope = 'sale', user_id = user_id)


	# taxes_obj = Product_taxes.objects.filter(scope = 'sale', company = company_id)

	for o in taxes_obj:
		taxes_list.append({'id':o.id, 'name':o.name, 'value':o.value, 'computation':o.computation})
		 

	return taxes_list 


def getQoutTemplate(company_id,user_id,roles):

	qout_tmpl = []
	
	if 'ROLE_MANAGE_ALL_QUOTATION' in roles :
		tpml_obj = Quotation_template.objects.filter(company = company_id,Is_Deleted = 0)

	elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
		tpml_obj = Quotation_template.objects.filter(create_by_user_id = user_id,Is_Deleted = 0)

	if len(tpml_obj)>0:
		for o in tpml_obj:
			qout_tmpl.append({'id':o.id, 'name': o.name})
	
	return qout_tmpl

def getPaymentTerms(company_id,user_id,roles):
	pt_list = []

	if 'ROLE_MANAGE_ALL_QUOTATION' in roles :
		pt_objs = Payment_term.objects.filter(company = company_id)

	elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
		pt_objs = Payment_term.objects.filter(create_by_user_id = user_id)

	for o in pt_objs:
		pt_list.append({'id':o.id , 'name':o.name})

	return pt_list

def getDeliveryMethods(company_id,user_id,roles):
	dm_list = []

	if 'ROLE_MANAGE_ALL_QUOTATION' in roles :
		dm_objs = Delivery_method.objects.filter(company = company_id)

	elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
		dm_objs = Delivery_method.objects.filter(create_by_user_id = user_id)


	for o in dm_objs:
		dm_list.append({'id':o.id , 'name':o.name})

	return dm_list



def getProduct(company_id,user_id,roles):
	product_list = []

	if 'ROLE_MANAGE_ALL_QUOTATION' in roles :
		product_objs = Product.objects.filter(product_tmpl__can_be_sold = 1, company = company_id).order_by('id')

	elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
		product_objs = Product.objects.filter(product_tmpl__can_be_sold = 1,create_by_user_id = user_id).order_by('id')
	
	for pro in product_objs:
		prodcut_name = ''
		# if pro.internal_reference is not None or pro.template_name is not None:
		# 	if pro.internal_reference is not None :
		# 		prodcut_name = pro.internal_reference+'  '
		if pro.template_name is not None :
			prodcut_name = pro.template_name
			product_list.append({'id':pro.id , 'name':prodcut_name})

	return product_list

def getProductData(request):
	company_id = request.user.profile.company_id
	data = {}
	data['success'] = False
	pro_id        = request.POST['id']
	user_obj     = request.user
	user_id       = user_obj.id

	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"
		
	discription  = ''
	sale_price   = 0.00
	uom_id       = ''
	uom_name     = ''
	uom_category = ''
	tax_id       = ''
	tax_name     = ''

	product_obj = Product.objects.get(pk=pro_id )

	if product_obj.product_tmpl is  not None:
		if product_obj.product_tmpl.sale_price is not None:
			sale_price = product_obj.product_tmpl.sale_price

		if product_obj.product_tmpl.description is not None:
			discription = product_obj.product_tmpl.description

		if product_obj.product_tmpl.tax_on_sale is not None:
			tax_id   = product_obj.product_tmpl.tax_on_sale_id
			tax_name = product_obj.product_tmpl.tax_on_sale.name

		if product_obj.product_tmpl.uofm is not None:
			uom_id = product_obj.product_tmpl.uofm.id
			uom_name = product_obj.product_tmpl.uofm.name

			if product_obj.product_tmpl.uofm.category is not None:
				uom_category = product_obj.product_tmpl.uofm.category.id

	json_uom = getUOMforProduct(uom_category , company_id)
	if len(json_uom)>0:
		data['json_uom'] = json_uom 

	json_products = getProduct(company_id,user_id,roles)
	if len(json_products)>0:
		data['json_products'] = json_products 


	json_taxes = getPorTaxes(company_id,user_id,roles)
	if len(json_taxes):
		data['json_taxes'] = json_taxes


	data['discription']  = discription
	data['sale_price'] 	 = sale_price
	data['uom_id'] 		 = uom_id
	data['uom_name'] 	 = uom_name
	data['tax_id'] 		 = tax_id
	data['tax_name'] 	 = tax_name
	data['uom_category'] = uom_category
	data['success']      = True

	return HttpResponse(json.dumps(data), content_type="application/json")

def getUOMforProduct(category_id , company_id):
	uom_list = []
	if category_id!='':
		uom_objs = Product_unit_of_measure.objects.filter(category_id = category_id, company = company_id)
	else: 
		uom_objs = Product_unit_of_measure.objects.filter(company = company_id)

	for uom in uom_objs:
		uom_list.append({
			'id': uom.id,
			'name': uom.name
			})

	return uom_list


@login_required(login_url="/login/")
def saveQuatation(request):
	data            = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	
	json_data   = json.loads(request.POST['fields'])
	
	
	tmpl_obj = Quotation_template()

	sale_order_obj = Sale_order()

	sale_order_obj.company        = company_id
	sale_order_obj.create_by_user = user_obj
	sale_order_obj.status	      = 'To Invoice'
	sale_order_obj.module_type	  = 'invoice'
	sale_order_obj.invoice_status = 'no'
	sale_order_obj.customer_order_reference = 'customer reference'  

	if 'customer_id' in json_data and json_data['customer_id']!= '' and int(json_data['customer_id'])>0 :
		sale_order_obj.customer_id = int(json_data['customer_id'])

	if 'customer_name' in json_data and json_data['customer_name']!= '':
		sale_order_obj.customer_name = json_data['customer_name']

	if 'quot_tmpl' in json_data and int(json_data['quot_tmpl']) == 0:
		tmpl_obj.name = 'Default Template'
		tmpl_obj.company        = company_id
		tmpl_obj.save()
		quot_tmpl = tmpl_obj.id
		sale_order_obj.qout_template_id = quot_tmpl

	elif 'quot_tmpl' in json_data and int(json_data['quot_tmpl'])> 0 and  json_data['quot_tmpl']!= '':
		sale_order_obj.qout_template_id = int(json_data['quot_tmpl'])

	if 'payment_term' in json_data and json_data['payment_term'] != '':
		sale_order_obj.payment_term_id = int(json_data['payment_term'])

	if 'delivery_method' in json_data and json_data['delivery_method']!= '':
		sale_order_obj.delivery_method_id = int(json_data['delivery_method'])		

	if 'tax_amt' in json_data and json_data['tax_amt'] != '':
		sale_order_obj.tax_amount = int(json_data['tax_amt'])	

	if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
		sale_order_obj.amount_untaxed = float(json_data['untaxed_amt'])
		if 'tax_amt' in json_data and json_data['tax_amt'] != '':
			sale_order_obj.total_amount = float(json_data['untaxed_amt'])+float(json_data['tax_amt'])
		else:
			sale_order_obj.total_amount = float(json_data['untaxed_amt'])

	if 'optax_amt' in json_data and json_data['optax_amt'] != '':
		sale_order_obj.optax_amount = int(json_data['optax_amt'])	

	if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
		sale_order_obj.opamount_untaxed = float(json_data['opuntaxed_amt'])
		if 'optax_amt' in json_data and json_data['optax_amt'] != '':
			sale_order_obj.optotal_amount = float(json_data['opuntaxed_amt'])+float(json_data['optax_amt'])
		else:
			sale_order_obj.optotal_amount = float(json_data['opuntaxed_amt'])

	if 'expexted_closing' in json_data and json_data['expexted_closing'] != '':
		sale_order_obj.expiration_date = datetime.strptime(json_data['expexted_closing'], "%m/%d/%Y")

	if 'order_date' in json_data and json_data['order_date'] != '':
		sale_order_obj.order_date = datetime.strptime(json_data['order_date'], "%m/%d/%Y")
	else:
		sale_order_obj.order_date =  datetime.today()

	if 'notes' in json_data: 
		sale_order_obj.notes = json_data['notes'] 

	sale_order_obj.save()

	so_id = sale_order_obj.id
	customer_id=sale_order_obj.customer_id

	name = 'SO'

	if len(str(so_id))==1:
		name = name+'00'+str(so_id)
	elif len(str(so_id))==2:
		name = name+'0'+str(so_id)
	elif len(str(so_id))>2:
		name = name+str(so_id)
	
	sale_order_obj.name = name
	sale_order_obj.save()
	
	if so_id>0:

		addProduct(json_data['products'], 'order', sale_order_obj, user_obj, company_id ,customer_id)
		addProduct(json_data['optional_products'], 'optional',  sale_order_obj, user_obj, company_id,customer_id)

	data['success'] = True
	data['id'] = so_id
	return HttpResponse(json.dumps(data), content_type="application/json")


# update quotation data 
@login_required(login_url="/login/")
def updateQuatation(request):
	data            = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	
	json_data   = json.loads(request.POST['fields'])

	# print(json_data)

	if 'id' in json_data and  json_data['id'] >0:
		try:
			sale_order_obj = Sale_order.objects.get(pk = int(json_data['id']))
			sale_order_obj.update_by_user = user_obj

			if 'customer_id' in json_data and json_data['customer_id']!= '' and int(json_data['customer_id'])>0:
				sale_order_obj.customer_id = int(json_data['customer_id'])
			else:
				sale_order_obj.customer_id = None

			if 'customer_name' in json_data and json_data['customer_name']!= '':
				sale_order_obj.customer_name = json_data['customer_name']
			else:
				sale_order_obj.customer_name = None

			if 'payment_term' in json_data and json_data['payment_term'] != '':
				sale_order_obj.payment_term_id = int(json_data['payment_term'])
			else:
				sale_order_obj.payment_term_id = None

			if 'quot_tmpl' in json_data and json_data['quot_tmpl']!= '':
				sale_order_obj.qout_template_id = int(json_data['quot_tmpl'])
			else:
				sale_order_obj.qout_template_id = None

			if 'delivery_method' in json_data and json_data['delivery_method']!= '':
				sale_order_obj.delivery_method_id = int(json_data['delivery_method'])
			else:
				sale_order_obj.delivery_method_id = None

			if 'tax_amt' in json_data and json_data['tax_amt'] != '':
				sale_order_obj.tax_amount = float(json_data['tax_amt'])	
			else:
				sale_order_obj.tax_amount  = 0.00

			if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
				sale_order_obj.amount_untaxed = float(json_data['untaxed_amt'])
				if 'tax_amt' in json_data and json_data['tax_amt'] != '':
					sale_order_obj.total_amount = float(json_data['untaxed_amt'])+float(json_data['tax_amt'])
				else:
					sale_order_obj.total_amount = float(json_data['untaxed_amt'])
			else:
				sale_order_obj.amount_untaxed = 0.00

			if 'optax_amt' in json_data and json_data['optax_amt'] != '':
				sale_order_obj.optax_amount = float(json_data['optax_amt'])	
			else:
				sale_order_obj.tax_amount  = 0.00

			if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
				sale_order_obj.opamount_untaxed = float(json_data['opuntaxed_amt'])
				if 'tax_amt' in json_data and json_data['optax_amt'] != '':
					sale_order_obj.optotal_amount = float(json_data['opuntaxed_amt'])+float(json_data['optax_amt'])
				else:
					sale_order_obj.optotal_amount = float(json_data['opuntaxed_amt'])
			else:
				sale_order_obj.opamount_untaxed = 0.00

			if 'expexted_closing' in json_data and json_data['expexted_closing'] != '':
				sale_order_obj.expiration_date = datetime.strptime(json_data['expexted_closing'], "%m/%d/%Y")
			else:
				sale_order_obj.expiration_date = None

			if 'order_date' in json_data and json_data['order_date'] != '':
				sale_order_obj.order_date = datetime.strptime(json_data['order_date'], "%m/%d/%Y")
			else:
				sale_order_obj.order_date =  datetime.today()

			if 'notes' in json_data: 
				sale_order_obj.notes = json_data['notes']
			else:
				sale_order_obj.notes = None

			sale_order_obj.save()

			so_id = sale_order_obj.id
			customer_id=sale_order_obj.customer_id

			Sale_order_record.objects.filter(order = sale_order_obj).delete()

			if so_id>0:
				addProduct(json_data['products'], 'order', sale_order_obj, user_obj, company_id,customer_id )
				addProduct(json_data['optional_products'], 'optional',  sale_order_obj, user_obj, company_id,customer_id )
			data['id'] = so_id
			data['success'] = True

		except Sale_order.DoesNotExist:
			data['success'] = False

	return HttpResponse(json.dumps(data), content_type = 'application/json')

def addProduct(products, line_type, so_obj, user_obj, company_id,customer_id):

	for pro in products:

		product_data = formatFields(pro['product_raw'])
		if product_data['pro_id'] is not None and product_data['pro_id']!='' :

			so_record_obj = Sale_order_record()

			so_record_obj.order          = so_obj
			so_record_obj.discription    = product_data['pro_discription']
			so_record_obj.customer       = customer_id
			so_record_obj.Product_id     = product_data['pro_id']
			so_record_obj.company        = company_id
			so_record_obj.create_by_user = user_obj
			so_record_obj.product_qty    = float(product_data['pro_qty'])
			so_record_obj.product_uom_id = int(product_data['pro_uom']) if product_data['pro_uom']!='' else None
			so_record_obj.discount       = float(product_data['pro_discount'])
			so_record_obj.unit_price     = float(product_data['pro_up'])

			if line_type == 'order':
				so_record_obj.Taxes_id       = int(product_data['pro_tax']) if product_data['pro_tax']!='' else None
				so_record_obj.tax_price      = float(product_data['record_tax'])
				so_record_obj.price_subtotal = float(product_data['pro_subtotal'])
				so_record_obj.price_total    = float(product_data['pro_subtotal'])+float(product_data['record_tax'])

			elif line_type == 'optional':
				# so_record_obj.Taxes_id       = int(product_data['pro_tax']) if product_data['pro_tax']!='' else None
				so_record_obj.tax_price      = float(product_data['record_tax'])
				so_record_obj.price_subtotal = float(product_data['pro_subtotal'])
				so_record_obj.price_total    = float(product_data['pro_subtotal'])+float(product_data['record_tax'])
				

		
			so_record_obj.line_type      = line_type
			so_record_obj.status         = 'Quotation'
			so_record_obj.invoice_status = 'no'

			so_record_obj.save()
		
	

		
def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields 


def getUomlist(company_id,user_id,roles):

	uom_list = []
	if 'ROLE_MANAGE_ALL_QUOTATION' in roles :
		uom_objs = Product_unit_of_measure.objects.filter(company = company_id)

	elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
		uom_objs = Product_unit_of_measure.objects.filter(create_by_id = user_id)

	if  len(uom_objs)>0:
 		for uom in uom_objs:
 			uom_list.append({'id':uom.id,
 						'name' : uom.name
 				})
	
	return uom_list

# return uom list serach more 
def getUomListdata(request):
	data = {}

	uom_list = []
	uom_objs = Product_unit_of_measure.objects.all()

	if  len(uom_objs)>0:
 		for uom in uom_objs:

 			category_name = ''
 			if uom.category is not None:
 				category_name = uom.category.name

 			uom_list.append({'id':uom.id,
 							'name' : uom.name,
 							'category_name' : category_name 
 				})

	if len(uom_list)>0:
		data['json_uom'] = uom_list

	return HttpResponse(json.dumps(data), content_type="application/json")




def getTaxesListdata(request):
	company_id = request.user.profile.company_id
	data = {}

	json_taxes = getPorTaxes(company_id,user_id,roles)

	if len(json_taxes):
		data['json_taxes'] = json_taxes

	return HttpResponse(json.dumps(data), content_type="application/json")


def viewdata(request, view_id):
	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id       = user_obj.id

	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"

	op_id_list = getOpIdList(request , company_id , user_id , roles)
	if len(op_id_list)>0:
		data['op_id_list'] = op_id_list

	quotation_data = getQuotationData(view_id, company_id,user_id,roles)

	if quotation_data is not None:
		data['quotation'] = quotation_data
		data['user_id'] = user_id
		data['success'] = True

	return HttpResponse(json.dumps(data), content_type = 'application/json')

def getOpIdList(request , company_id , user_id , roles ):
    op_id_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:

    	op_objs = Sale_order.objects.filter(company = company_id,module_type='invoice').order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles :

    	op_objs = Sale_order.objects.filter(create_by_user_id = user_id,module_type='invoice').order_by('id')

    for op in op_objs:
        op_id_list.append({'id':op.id})

    return op_id_list

def getOpIdListedit(request , company_id , user_id , roles ):
    op_id_list = []

    if 'ROLE_MANAGE_ALL_QUOTATION' in roles :

    	op_objs = Sale_order.objects.filter(company = company_id,module_type='invoice').order_by('id')

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles :

    	op_objs = Sale_order.objects.filter(create_by_user_id = user_id,module_type='invoice').order_by('id')

    for op in op_objs:
        op_id_list.append({'id':op.id})

    return op_id_list


def getQuotationData(id, company_id,user_id,roles):

	try:
		quatations_obj = Sale_order.objects.get(pk = int(id))

		customer_name = ''
		customer_id   = ''
		if  quatations_obj.customer_id is not None:
			customer_id   = quatations_obj.customer_id
			customer_name = quatations_obj.customer_name

		quot_tmpl_id   = ''
		quot_tmpl_name = ''
		if  quatations_obj.qout_template is not None:
			quot_tmpl_id   = quatations_obj.qout_template_id
			quot_tmpl_name = quatations_obj.qout_template.name

		payment_term_id = ''
		pay_tm_name  = ''
		if  quatations_obj.payment_term is not None:
			payment_term_id = quatations_obj.payment_term_id
			pay_tm_name    = quatations_obj.payment_term.name

		dm_id   = ''
		dm_name = ''

		if quatations_obj.delivery_method is not None:
			dm_id   = quatations_obj.delivery_method_id
			dm_name = quatations_obj.delivery_method.name

		contactp= Contact.objects.filter(id=customer_id)
		if  contactp is not None:
			for cp in contactp:
				profile_image =  cp.profile_image
				
				profile_image1 = "http://46.255.162.226:8000" + profile_image

		json_address = view_field_value(company_id,customer_id)
		fields = {}
		address_list = json_address 
		# print(address_list)
		for json_obj in address_list:
			add = json_obj['fields']
			for json_obj1 in add:
				fields[json_obj1["name"]] = json_obj1["value"]
				# print(fields)
			address_street = fields['Street'] if fields['Street'] is not None else ''
			address_street2 = fields['Street2'] if fields['Street2'] is not None else ''
			address_city = fields['City'] if fields['City'] is not None else ''
			address_state = fields['State'] if fields['State'] is not None else ''
			address_country = fields['Country'] if fields['Country'] is not None else ''
			address_zip = fields['Zip'] if fields['Zip'] is not None else ''
			
			address_json = fields['Street'] + ',' + fields['Street2'] + ',' + fields['City'] + ',' + fields['State']+ ',' + fields['Country'] +',' + fields['Zip']

			mobile = fields['Mobile'] if fields['Mobile'] is not None else ''
			# print(address_json)
			# for json_obj1 in json_obj:
			# 	fields[json_obj1["name"]] = json_obj1["value"]
			# 	print(fields)

		contact_field_valuet = ContactFieldsValue.objects.select_related('contact','contact_field').all()
		contact_field_value = contact_field_valuet.filter(user_id=user_id).filter(contact_id= (customer_id))
		for ct in contact_field_value:
			if ct.contact_field.name == "email" and ct.contact_field.is_default:

				contact_field_value_id =  ct.contact_field_value
				# email_list.append({'email_list': ct.contact_field_value})

		if quatations_obj.expiration_date!=""  and quatations_obj.expiration_date is not None :
			new_dt1 = str(quatations_obj.expiration_date);
			expiration_date1 = datetime.strptime(new_dt1, "%Y-%m-%d").strftime("%d/%m/%Y")
		else:
			expiration_date1 = None

		if quatations_obj.order_date!=""  and quatations_obj.order_date is not None :
			new_dt2 = str(quatations_obj.order_date);
			order_date1 = datetime.strptime(new_dt2, "%Y-%m-%d").strftime("%d/%m/%Y")
		else:
			order_date1 = None


		quotation_dict = {	'id' : quatations_obj.id,
							'user_id' : quatations_obj.create_by_user_id,
						 	'name' : quatations_obj.name,
						 	'mobile' : mobile,
						 	'address_street' : address_street,
						 	'address_street2' : address_street2,
						 	'address_city' : address_city,
						 	'address_state' : address_state,
						 	'address_country' : address_country,
						 	'address_zip' : address_zip,
						 	'customer_address' : address_json,
							'customer_id' : customer_id,
							'customer_name' : customer_name,
							'profile_image' : profile_image,
							'profile_image1' : profile_image1,
							'customer_email' : contact_field_value_id,
							'sales_person_id' : quatations_obj.sales_person,
							'opportunity_id' : quatations_obj.opportunity_id,
							'customer_invoice_id' : quatations_obj.customer_invoice_id,
							'notes': quatations_obj.notes,
							'customer_order_reference': quatations_obj.customer_order_reference,
							'expiration_date': str(quatations_obj.expiration_date),
							'order_date' : str(quatations_obj.order_date),
							'expiration_date1': expiration_date1,
							'order_date1' : order_date1,
							'qout_tmpl_id' : quot_tmpl_id,
							'qout_tmpl_name' : quot_tmpl_name,
							'payment_term' : payment_term_id,
							'pay_tm_name' : pay_tm_name,
							'delivery_method_id' : dm_id,
							'delivery_method_name' : dm_name,
							'amount_untaxed' : quatations_obj.amount_untaxed,
							'tax_amount' : quatations_obj.tax_amount,
							'total_amount' : quatations_obj.total_amount,
							'opamount_untaxed' : quatations_obj.opamount_untaxed,
							'optax_amount' : quatations_obj.optax_amount,
							'optotal_amount' : quatations_obj.optotal_amount,
							'status' : quatations_obj.status,
							'invoice_status' : quatations_obj.invoice_status
		}

		quotation_dict['products'] = getQuotationProduct(quatations_obj.id, 'order', company_id,user_id,roles)
		quotation_dict['optional_products'] = getQuotationProduct(quatations_obj.id, 'optional', company_id,user_id,roles)		

		
		return  quotation_dict

	except Sale_order.DoesNotExist:
		return  None

def view_field_value(user_company_id, contact_id):
    contact_id = str(contact_id)
    tab =[]
    contact_tabs = ContactTab.objects.all().filter(company_id=user_company_id).order_by('display_weight')
    print("contact_tabs",contact_tabs.query)
    if contact_tabs is not None:
        for o in contact_tabs:
            tab_dic = {'tab_id': o.id, 'tab_name': o.name, 'is_default': o.is_default, 'fields': []}
            field_ids = ', '.join([str(x) for x in o.fields])
            contact_fields = ContactFieldsValue.contact_field_value_data(contact_id, field_ids)
            print("contact_fields", contact_fields.query)
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
                            tag_list.append({'color':t['color'], 'name':t['name']})
                        contact_field_value = tag_list
                    except:
                        contact_field_value = tag_list
                fields_dic = {'id': f.id, 'name': f.label, 'display_position': f.display_position,
                              'field_value_id': contact_field_value_id, 'value': contact_field_value,
                              'type':f.type
                              }
                tab_dic['fields'].append(fields_dic)
            tab.append(tab_dic)
    return tab
def getQuotationProduct(id ,line_type, company_id,user_id,roles):
	pro_record_list = []
	s_o_r_dict = Sale_order_record.objects.filter(order_id=id, line_type = line_type).order_by('id')

	if len(s_o_r_dict)>0:
		for o in s_o_r_dict:
			
			uom_name     = ''
			product_name = 'Product Deleted'
			tax_id       = ''
			tax_name     = ''
			json_uom     = []
			if o.product_uom is not None:
				uom_name = o.product_uom.name
				if o.product_uom.category_id is not None:
					json_uom = getUOMforProduct(o.product_uom.category_id , company_id)

			if o.Product is not None:
				product_name = o.Product.internal_reference if o.Product.internal_reference is not None else ''
				product_name = product_name+' '
				product_name = product_name+ o.Product.template_name if o.Product.template_name is not None else '' 

				if o.Taxes is not None:
					tax_id   = o.Taxes.id
					tax_name = o.Taxes.name

			json_taxes = getPorTaxes(company_id,user_id,roles)

 

			pro_record_list.append({
				'id':o.id,
				'Product':o.Product_id,
				'product_name': product_name,
				'product_description': o.discription,
				'customer':o.customer,
				'sales_person':o.sales_person,
				'product_qty':o.product_qty,
				'product_uom':o.product_uom_id,
				'product_uom_name':uom_name,
				'product_tax_id' : tax_id , 
				'product_tax_name':tax_name ,
				'unit_price':o.unit_price,
				'tax_price':o.tax_price,
				'price_subtotal':o.price_subtotal,
				'price_total':o.price_total,
				'price_reduce':o.price_reduce,
				'discount':o.discount,
				'json_uom': json_uom
				})

	return pro_record_list 


def getCustomerNameByID(id):
	customer_name = ''	
	customer = customers_objs

	for o in customer:
		if id== o['id']:
			customer_name = o['name']

	return customer_name




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

	quotation_data = getQuotationData(edit_id,company_id,user_id,roles)
	if quotation_data is not None:
		data['quotation'] = quotation_data  
		data['success'] = True

	return HttpResponse(json.dumps(data), content_type = 'application/json')


def getTemplateDataByID(request):
	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id         = user_obj.id

	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"

	tmpl_id = request.POST['id']

	products = getTeamplteProduct(int(tmpl_id), 'order', company_id,user_id,roles)
	optionals = getTeamplteProduct(int(tmpl_id), 'optional', company_id,user_id,roles)

	data['products']  = products
	data['optionals'] = optionals

	data['success'] = True

	return HttpResponse(json.dumps(data), content_type = 'application/json')

def getTeamplteProduct(id ,line_type ,company_id,user_id,roles):
	pro_record_list = []
	q_t_r_dict = Quotation_template_record.objects.filter(quotation_template_id =id, line_type =line_type).order_by('id')


	if len(q_t_r_dict)>0:
		for o in q_t_r_dict:
			
			uom_name = ''
			tax_id   = ''
			tax_name = ''
			json_uom = []
			if o.product_uom is not None:
				uom_name = o.product_uom.name
				if o.product_uom.category_id is not None:
					json_uom = getUOMforProduct(o.product_uom.category_id , company_id)

			# product_name = o.Product.internal_reference if o.Product.internal_reference is not None else ''
			# product_name = product_name+' '
			# product_name = product_name+ o.Product.template_name if o.Product.template_name is not None else '' 

			product_name = o.Product.template_name if o.Product.template_name is not None else '' 
			json_taxes = getPorTaxes(company_id,user_id,roles)

			# print(json_taxes)
			# print(o.Product.product_tmpl.tax_on_sale_id)
			# print(o.Product.product_tmpl.tax_on_sale_id)
			# print(o.Product)
			# if o.Product.product_tmpl.tax_on_sale is not None:

				# tax_id   = o.Product.product_tmpl.tax_on_sale_id

				# print('tax_id')
				# print(tax_id)
				# tax_name = o.Product.product_tmpl.tax_on_sale.name
				# print('tax_name' + tax_name )
			if o.Taxes is not None:
				tax_name = o.Taxes.name
			pro_record_list.append({
				'id':o.id,
				'Product':o.Product_id,
				'product_name': product_name,
				'product_description': o.discription,
				'product_qty':o.product_qty,
				'product_up':o.unit_price,
				'product_uom':o.product_uom_id,
				'product_uom_name':uom_name,
				'product_tax_id' : o.Taxes_id, 
				'product_tax_name':tax_name ,
				'discount':o.discount,
				'json_uom': json_uom , 
				'json_taxes' : json_taxes
				})


	return pro_record_list

# def getRecipients(request):
# 	data = {}
# 	data['success'] = False

# 	data['recipients_json'] = customers_objs
# 	data['success'] = True

# 	return HttpResponse(json.dumps(data), content_type= 'application/json')



def updateQuotStatus(request, quot_id):
	data = {}
	data['success'] = False

	status = request.POST['status']

	try:
		qout_obj = Sale_order.objects.get(pk=int(quot_id))
		qout_obj.status = status
		qout_obj.save()
		data['success'] = True 
	except Sale_order.DoesNotExist:
		pass

	return HttpResponse(json.dumps(data), content_type= 'application/json') 


# def sendQuoteEmail1(request):
# 	data = {}
# 	data['success'] = False

# 	fields = json.loads(request.POST['fields'])

# 	recipt_str = fields['recipients']
# 	msg        = fields['content']
# 	subject    = fields['subject']

# 	recipt_id_list = recipt_str.split(",")

# 	if len(recipt_id_list)>0:
# 		# email_list = 'sohampatel1908@gmail.com'
# 		# print(email_list)

# 		s = smtplib.SMTP('smtp.gmail.com')
# 		s.set_debuglevel(1)
# 		msg = MIMEText("""body""")
# 		sender = 'soham@multilinetechnolabs.com'
# 		recipients = ['sohampatel1908@gmail.com', '100hampatel@gmail.com','sohamchabliya81@gmail.com']
# 		msg['Subject'] = "subject line helllooo Bro"
# 		msg['From'] = sender
# 		msg['To'] = ", ".join(recipients)
# 		result = s.sendmail(sender, recipients, msg.as_string())
# 		# result = send_mail(subject, msg, 'from@example.com', email_list, fail_silently=False,)
# 		print(result)
# 		data['success'] = True

# 	return HttpResponse(json.dumps(data), content_type= 'application/json') 

def getRecipients(request):
	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id         = user_obj.id

	# customers_objs = contact()

	com_list = []
	customers_objs = Contact.objects.all()

	if  len(customers_objs)>0:
 		for com in customers_objs:

 			name = ''
 			if com.name is not None:
 				name = com.name

 			com_list.append({'id':com.id,
 							'name' : com.name,
 				})

	if len(com_list)>0:
		data['recipients_json'] = com_list
	# data['recipients_json'] = customers_objs
	data['success'] = True

	return HttpResponse(json.dumps(data), content_type= 'application/json')
def sendQuoteEmail(request):

	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id         = user_obj.id

	fields = json.loads(request.POST['fields'])

	recipt_str = fields['recipients']
	msg        = fields['content']
	subject    = fields['subject']
	print(subject)
	print(msg)
	recipt_id_list = recipt_str.split(",")
	print(recipt_id_list)

	if len(recipt_id_list)>0:
		email_list  = getCustomerEmailAddr(recipt_id_list,user_id)
		# print(email_list)
		for x in email_list:
			# print(x)	
			email_list = x['email_list']

			result = send_mail(subject, msg, 'sohampatel1908@gmail.com', [email_list],fail_silently=False,)
			data['success'] = True

	return HttpResponse(json.dumps(data), content_type= 'application/json')


def getCustomerEmailAddr(id_list,user_id):

	email_list = []
	contact_field_valuet = ContactFieldsValue.objects.select_related('contact','contact_field').all()
	contact_field_value = contact_field_valuet.filter(user_id=user_id).filter(contact_id__in= (id_list))
	for ct in contact_field_value:
		if ct.contact_field.name == "email" and ct.contact_field.is_default:
			email_list.append({'email_list': ct.contact_field_value})
			# email_list = ct.contact_field_value
			# print(email_list)
			# print(email_list)
	return email_list

def deleteInvoice(request):
	data = {}
	data['success'] = False

	id_list  = json.loads(request.POST['ids'])

	if len(id_list)>0:
		for i in id_list:
			try:
				quot_obj = Sale_order.objects.get(pk=int(i)).delete()
			except quot_obj.DoesNotExist:
				pass

		data['success'] = True

	return HttpResponse(json.dumps(data), content_type= 'application/json')








