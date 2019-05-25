from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.db.models import Q
import json
from datetime import date, datetime, time, timedelta
from next_crm.views.CustomerInvoice import display_tax_calculation
from next_crm.helper.utils import Utils
from next_crm.helper.company import get_currency_name, format_date
from next_crm.models import Product_taxes,Quotation_template,Quotation_template_record, Product_unit_of_measure,Product

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
def viewdata(request, uuid):
	data = {'success': False}
	utils = Utils()
	company_id = request.user.profile.company_id
	user_obj   = request.user
	user_id    = user_obj.id
	try:
		res = Quotation_template.objects.get(uuid=uuid, company_id=company_id)
		if res:
			view_id = res.id
			currency = get_currency_name(company_id)
			try:
				roles = request.user.profile.roles
			except roles.DoesNotExist:
				roles = "ADMIN"
			products = getTeamplteProduct(view_id, 'order',company_id,user_id,roles)
			optionals = getTeamplteProduct(view_id, 'optional',company_id,user_id,roles)
			product_tax_return_data = display_tax_calculation(products)
			expiration_date = datetime.strptime(str(res.expiration_date), "%Y-%m-%d").strftime("%m/%d/%Y")
			template = {'id':res.id ,
						'name': res.name,
						'terms_and_codition':res.terms_and_codition,
						'expiration_date': (expiration_date),
						'expiration_delay': (res.expiration_delay),
						'products' : products ,
						'optionals': optionals ,
						'currency': currency ,
						'amount_untaxed' : res.amount_untaxed,
						'tax_amount' : utils.round_value(product_tax_return_data['total_tax']),
						'multiple_tax': product_tax_return_data['multiple_tax_list'],
						'total_amount' : res.total_amount,
						'opamount_untaxed' : res.opamount_untaxed,
						'optax_amount' : res.optax_amount,
						'optotal_amount' : res.optotal_amount,
						}

			data['template'] = template
			data['success'] = True

	except Quotation_template.DoesNotExist:
		data['success'] = False

	return HttpResponse(json.dumps(data), content_type="application/json")



@login_required(login_url="/login/")
def editdata(request, uuid):
	data = {'success': False}
	utils = Utils()
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	user_id         = user_obj.id

	try:
		roles = request.user.profile.roles
	except roles.DoesNotExist:
		roles = "ADMIN"

	try:
		res = Quotation_template.objects.get(uuid=uuid, company_id=company_id)
		if res:
			edit_id = res.id
			currency = get_currency_name(company_id)
			products = getTeamplteProduct(edit_id, 'order',company_id, user_id,roles)
			optionals = getTeamplteProduct(edit_id, 'optional',company_id,user_id,roles)
			product_tax_return_data = display_tax_calculation(products)
			expiration_date = datetime.strptime(str(res.expiration_date), "%Y-%m-%d").strftime("%m/%d/%Y")

			template = {'id':res.id ,
						'name': res.name,
						'terms_and_codition':res.terms_and_codition,
						'expiration_date': (expiration_date),
						'expiration_delay': (res.expiration_delay),
						'products' : products ,
						'optionals': optionals ,
						'currency': currency ,
						'amount_untaxed' : res.amount_untaxed,
						'tax_amount' : utils.round_value(product_tax_return_data['total_tax']),
						'multiple_tax': product_tax_return_data['multiple_tax_list'],
						'total_amount' : res.total_amount,
						'opamount_untaxed' : res.opamount_untaxed,
						'optax_amount' : res.optax_amount,
						'optotal_amount' : res.optotal_amount,
						}
			data['template'] = template
			data['success'] = True
	except Quotation_template.DoesNotExist:
		data['success'] = False
	return HttpResponse(json.dumps(data), content_type = "application/json")


@login_required(login_url="/login/")
def listdata(request):
	data         = {}
	company_id   = request.user.profile.company_id
	user_obj     = request.user
	user_id      = user_obj.id
	templates    = []
	templates_list = []
	can_remove = True

	limit  = settings.PAGGING_LIMIT
	offset = ""

	try:
		roles = request.user.profile.roles
	except roles.DoesNotExist:
		roles = "ADMIN"

	if request.method=="POST":
		json_data = json.loads(request.POST['fields'])
		parameter = formatFields(json_data)

		names = json.loads(request.POST['names'])

		offset = int(parameter['offset'])
		limit = offset + int(limit)
		orderby = '-id'

		if 'ROLE_MANAGE_ALL_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
			templates = Quotation_template.objects.filter(company_id = company_id)
			like_cond = Q()
			if len(names) > 0:
				orderby = 'name'
				for name in names:
					like_cond = like_cond | Q(name__icontains = name)
				templates = templates.filter(like_cond)

		elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles:
			templates = Quotation_template.objects.filter(company_id = company_id, create_by_user = user_id)
			like_cond = Q()
			if len(names) > 0:
				orderby = 'name'
				for name in names:
					like_cond = like_cond | Q(name__icontains = name)
				templates = templates.filter(like_cond)

		quatations_temp = Quotation_template.objects.filter(company_id = company_id)
		if len(quatations_temp) < 1:
			tmpl_obj = Quotation_template()
			tmpl_obj.name = 'Default Template'
			tmpl_obj.expiration_date = 30
			tmpl_obj.company_id = company_id
			tmpl_obj.user_id    = user_id
			tmpl_obj.create_by    = user_obj
			tmpl_obj.Is_Default = 1
			tmpl_obj.save()
		total_templates = len(templates)
	
		templates = templates.order_by(orderby)
		templates = templates[offset:limit]

		data['total_count'] = total_templates

		if len(templates) > 0:
			for o in templates:
				templates_list.append({'id':o.id, 'uuid':str(o.uuid), 'template_name': o.name,
									   'can_remove' :can_remove ,
									   'expire_delay':o.expiration_delay,
									   'expire_date':format_date(o.expiration_date, request.user.profile.company.currency)})
	data['templates'] = templates_list



	return HttpResponse(json.dumps(data), content_type="application/json")



@login_required(login_url="/login/")
def adddata(request):
	data = {}
	company_id   = request.user.profile.company_id
	currency		= get_currency_name(company_id)


	data['currency']       = currency

	return HttpResponse(json.dumps(data), content_type="application/json") 


def getOpIdList(request , company_id):

    op_id_list = []
    op_objs = Quotation_template.objects.filter(company = company_id).order_by('id')



    for op in op_objs:
        op_id_list.append({'id':op.id})

    return op_id_list

def getTaxesListdata(request):
	company_id = request.user.profile.company_id
	data = {}

	json_taxes = getPorTaxes(company_id,user_id,roles)

	if len(json_taxes):
		data['json_taxes'] = json_taxes

	return HttpResponse(json.dumps(data), content_type="application/json")

def getPorTaxes(company_id,user_id,roles):

	taxes_list = []
	if 'ROLE_MANAGE_ALL_QUOTATION' in roles :
		taxes_obj = Product_taxes.objects.filter(scope = 'sale', company = company_id)

	elif 'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION' in roles:
		taxes_obj = Product_taxes.objects.filter(scope = 'sale', user_id = user_id)


	for o in taxes_obj:
		taxes_list.append({'id':o.id, 'name':o.name, 'value':o.value, 'computation':o.computation})
		 

	return taxes_list 


def getTeamplteProduct(id ,line_type ,company_id, user_id, roles):
	utils = Utils()
	pro_record_list = []
	q_t_r_dict = Quotation_template_record.objects.filter(quotation_template_id =id, line_type =line_type).order_by('id')
	if len(q_t_r_dict) > 0:
		for o in q_t_r_dict:

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
				'record_id': o.id,
				'uuid': product_uuid,
				'Product': o.Product_id,
				'product_name': product_name,
				'product_description': o.discription,
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



def getProduct(company_id):
	product_list = []

	product_objs = Product.objects.filter(product_tmpl__can_be_sold = 1, company = company_id)

	for pro in product_objs:
		prodcut_name = ''

		if pro.template_name is not None :
			prodcut_name = prodcut_name+pro.template_name
			product_list.append({'id':pro.id , 'name':prodcut_name})
		

	return product_list


def getUomlist(company_id):
	uom_list = []
	uom_objs = Product_unit_of_measure.objects.filter(company = company_id)

	if  len(uom_objs)>0:
 		for uom in uom_objs:
 			uom_list.append({'id':uom.id,
 						'name' : uom.name
 				})
	
	return uom_list


def saveTemplate(request):
	data            = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	
	json_data   = json.loads(request.POST['fields'])

	if 'name' in json_data and json_data['name']!='':
		tmpl_obj = Quotation_template()

		tmpl_obj.name    = json_data['name']
		tmpl_obj.company_id = company_id
		tmpl_obj.create_by_user = user_obj

		if 'tax_amt' in json_data and json_data['tax_amt'] != '':
			tmpl_obj.tax_amount = int(json_data['tax_amt'])	

		if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
			tmpl_obj.amount_untaxed = float(json_data['untaxed_amt'])
			if 'tax_amt' in json_data and json_data['tax_amt'] != '':
				tmpl_obj.total_amount = float(json_data['untaxed_amt'])+float(json_data['tax_amt'])
			else:
				tmpl_obj.total_amount = float(json_data['untaxed_amt'])

		if 'optax_amt' in json_data and json_data['optax_amt'] != '':
			tmpl_obj.optax_amount = int(json_data['optax_amt'])	

		if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
			tmpl_obj.opamount_untaxed = float(json_data['opuntaxed_amt'])
			if 'optax_amt' in json_data and json_data['optax_amt'] != '':
				tmpl_obj.optotal_amount = float(json_data['opuntaxed_amt'])+float(json_data['optax_amt'])
			else:
				tmpl_obj.optotal_amount = float(json_data['opuntaxed_amt'])

		if 'term_condition' in json_data:  
			tmpl_obj.terms_and_codition = json_data['term_condition']
		
		if 'expiration_delay' in json_data and json_data['expiration_delay']!='':
			tmpl_obj.expiration_delay = json_data['expiration_delay']
			tmpl_obj.expiration_date = datetime.now() + timedelta(days=int(json_data['expiration_delay']))

		tmpl_obj.save()

		if tmpl_obj.id > 0:
			addProduct(json_data['products'],'order',  tmpl_obj, user_obj, company_id)
			addProduct(json_data['optional_products'],'optional', tmpl_obj, user_obj, company_id)
			data['success'] = True
			data['uuid'] = str(tmpl_obj.uuid)

	return HttpResponse(json.dumps(data), content_type="application/json")


def updateTemplate(request):
	utils = Utils()
	data = {'success': False}
	company_id = request.user.profile.company_id
	user_obj = request.user

	json_data = json.loads(request.POST['fields'])

	if 'id' in json_data and json_data['id']:
		try:
			tmpl_obj = Quotation_template.objects.get(uuid=json_data['id'])
			tmpl_obj.name    = json_data['name']
			tmpl_obj.company_id = company_id
			tmpl_obj.update_by_user = user_obj

			if 'tax_amt' in json_data and json_data['tax_amt'] != '':
				tmpl_obj.tax_amount = int(json_data['tax_amt'])	

			if 'untaxed_amt' in json_data and json_data['untaxed_amt'] != '':
				tmpl_obj.amount_untaxed = utils.round_value(json_data['untaxed_amt'])
				if 'tax_amt' in json_data and json_data['tax_amt'] != '':
					tmpl_obj.total_amount = utils.round_value(json_data['untaxed_amt'])+utils.round_value(json_data['tax_amt'])
				else:
					tmpl_obj.total_amount = utils.round_value(json_data['untaxed_amt'])

			if 'optax_amt' in json_data and json_data['optax_amt'] != '':
				tmpl_obj.optax_amount = utils.round_value(json_data['optax_amt'])

			if 'opuntaxed_amt' in json_data and json_data['opuntaxed_amt'] != '':
				tmpl_obj.opamount_untaxed = utils.round_value(json_data['opuntaxed_amt'])
				if 'optax_amt' in json_data and json_data['optax_amt'] != '':
					tmpl_obj.optotal_amount = utils.round_value(json_data['opuntaxed_amt'])+utils.round_value(json_data['optax_amt'])
				else:
					tmpl_obj.optotal_amount = utils.round_value(json_data['opuntaxed_amt'])

			if 'notes' in json_data:
				tmpl_obj.terms_and_codition = json_data['notes']
			
			if 'expiration_delay' in json_data and json_data['expiration_delay']!='':
				tmpl_obj.expiration_delay = json_data['expiration_delay']
				tmpl_obj.expiration_date = datetime.now() + timedelta(days=int(json_data['expiration_delay']))

			tmpl_obj.save()

			if tmpl_obj.id > 0:
				Quotation_template_record.objects.filter(quotation_template = tmpl_obj, company_id = company_id).delete()
				addProduct(json_data['products'],'order',  tmpl_obj, user_obj, company_id)
				addProduct(json_data['optional_products'],'optional', tmpl_obj, user_obj, company_id)
			data['success'] = True
			data['uuid'] = json_data['id']

		except Quotation_template.DoesNotExist:
			data['success'] = False

	return HttpResponse(json.dumps(data), content_type="application/json")

def addProduct(products, line_type, tmpl_obj, user_obj, company_id):
	for pro in products:
		if pro['product_id'] is not None and pro['product_id'] != '':
			product = Product.objects.get(uuid=pro['product_id'], company_id=company_id)
			if product:
				qtr_obj = Quotation_template_record()
				qtr_obj.quotation_template = tmpl_obj
				qtr_obj.discription = pro['description']
				qtr_obj.Product_id = product.id
				qtr_obj.company_id = company_id
				qtr_obj.create_by_user = user_obj
				qtr_obj.product_qty = pro['order_qty']
				qtr_obj.product_uom_id = int(pro['uom']) if 'uom' in pro and pro['uom'] != '' else None
				qtr_obj.discount = float(pro['discount'])
				qtr_obj.unit_price = float(pro['unit_price'])
				qtr_obj.line_type = line_type
				if line_type == 'order':
					qtr_obj.Taxes_id = int(pro['tax']) if 'tax' in pro and pro['tax'] != '' else None
					qtr_obj.tax_price = float(pro['tax_amt'])
					qtr_obj.price_subtotal = float(pro['subtotal'])
					qtr_obj.price_total = float(pro['subtotal']) + float(pro['tax_amt'])
				qtr_obj.save()



def formatFields(json_data):
	fields = {}
	for json_obj in json_data:
		fields[json_obj["name"]] = json_obj["value"]
	return fields

def deletetemplate(request):
	data = {}
	data['success'] = False
	id_list  = json.loads(request.POST['ids'])
	if len(id_list)>0:
		for i in id_list:
			try:
				quot_obj =Quotation_template.objects.filter(pk = int(i)).update(Is_Deleted = 1)
			except quot_obj.DoesNotExist:
				pass
		data['success'] = True
	return HttpResponse(json.dumps(data), content_type= 'application/json')

@login_required(login_url="/login/")
def get_quot_template_term(request):
	return_status = {'success': False, 'result': []}
	company_id = request.user.profile.company_id
	if request.method == "POST" and request.is_ajax():
		quot_templete = Quotation_template.objects.filter(company=company_id)
		if 'keyword' in request.POST:
			keyword = request.POST['keyword']
			quot_templete = quot_templete.filter(name__icontains=keyword)
		if len(quot_templete) > 0:
			quot_templete = quot_templete.order_by('-id')[:10]
			return_status['success'] = True
			for category in quot_templete:
				name = category.name
				temp_dic = {'id': category.id, 'uuid':str(category.uuid), 'name':name}
				return_status['result'].append(temp_dic)
	return HttpResponse(json.dumps(return_status), content_type='application/json')
