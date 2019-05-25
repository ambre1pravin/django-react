from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.db.models import Q
import json
from next_crm.models import EmailTemplate, AttachDocument,  Quotation_template,Quotation_template_record,Product_taxes, Product_unit_of_measure,Product

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
def editdata(request, edit_id):
	data = {'success':False}
	company_id      = request.user.profile.company_id
	user_obj        = request.user
	files_attachment = []
	try:
		qt = EmailTemplate.objects.get(pk = edit_id, company_id=company_id)
		template_attchement = AttachDocument.objects.filter(email_template_id=edit_id)
		if template_attchement:
			for attachment in template_attchement:
				files_attachment.append({'id':attachment.id, 'file_name':attachment.file_name, 'file_path':attachment.file_path})

		template = {'id':qt.id , 
					'name': qt.name,  
					'description':qt.description, 
					'subject':qt.subject,
					'module_type':qt.module_type,
					'attachment':files_attachment
					}
		if qt.image_path != '' and qt.image_path is not None :
			eml_list = qt.image_path.split('|')
		else:
			eml_list = None

		if eml_list !='' and eml_list is not None:
			data['image_path'] = eml_list

		data['template'] = template
		data['success'] = True

	except EmailTemplate.DoesNotExist:
		data['success'] = False

	data['success'] = True


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
		limit = offset+int(limit)
		orderby = '-id'

		templates = EmailTemplate.objects.filter(company_id=company_id)
		like_cond = Q()
		if len(names) > 0:
			orderby = 'name'
			for name in names:
				like_cond = like_cond | Q(name__icontains = name)
				templates = templates.filter(like_cond)

		total_templates = len(templates)
		templates = templates.order_by(orderby)
		templates = templates[offset:limit]

		data['total_count'] = total_templates
		if len(templates) > 0:
			for o in templates:
				templates_list.append({
										'id':o.id,
										'template_name': o.name,
										'subject': o.subject,
										'module_type': o.module_type,
										'is_default':o.is_default
									})

	data['templates'] = templates_list
	return HttpResponse(json.dumps(data), content_type="application/json")



@login_required(login_url="/login/")
def adddata(request):
	data = {}
	company_id   = request.user.profile.company_id
	user_obj     = request.user
	currency		= request.user.profile.company.currency

	json_products = getProduct(company_id)
	if len(json_products)>0:
		data['json_products'] = json_products 

	json_uom = getUomlist(company_id)
	if len(json_uom)>0:
		data['json_uom'] = json_uom

	data['currency']       = currency

	return HttpResponse(json.dumps(data), content_type="application/json") 

@login_required(login_url="/login/")
def viewdata(request, view_id):
	
	data       = {}
	company_id = request.user.profile.company_id
	user_obj   = request.user
	user_id         = user_obj.id
	currency		= request.user.profile.company.currency

	try:
		roles = request.user.profile.roles
	except Profile.DoesNotExist:
		roles = "ADMIN"

	data['success'] = False

	try:
		qt = EmailTemplate.objects.get(pk = view_id)

		template = {'id':qt.id , 
					'name': qt.name,  
					'subject':qt.subject, 
					'description': qt.description,
					}

		if qt.image_path != '' and qt.image_path is not None :
			eml_list = qt.image_path.split('|')
		else:
			eml_list = None

		if eml_list !='' and eml_list is not None:
			data['image_path'] = eml_list
			
		data['template'] = template
		data['success'] = True

	except EmailTemplate.DoesNotExist:
		data['success'] = False

	data['success'] = True

	return HttpResponse(json.dumps(data), content_type="application/json") 

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

			product_name = o.Product.template_name if o.Product.template_name is not None else ''
			if o.Taxes is not None:
				tax_id   = o.Taxes.id
				tax_name = o.Taxes.name
				
			json_taxes = getPorTaxes(company_id,user_id,roles)

			pro_record_list.append({
				'id':o.id,
				'Product':o.Product_id,
				'product_name': product_name,
				'product_description': o.discription,
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
		tmpl_obj.company = company_id
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
		
		if 'expiration_date' in json_data and json_data['expiration_date']!='': 
			tmpl_obj.expiration_date = json_data['expiration_date']

		tmpl_obj.save()

		if tmpl_obj.id>0:
			addProduct(json_data['products'],'order',  tmpl_obj, user_obj, company_id)
			addProduct(json_data['optional_products'],'optional', tmpl_obj, user_obj, company_id)

			data['success'] = True

	return HttpResponse(json.dumps(data), content_type="application/json")


def updateTemplate(request):
	data            = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user

	json_data   = json.loads(request.POST['fields'])

	if 'id' in json_data and int(json_data['id'])>0 and 'name' in json_data and json_data['name']!='':
		

		try:
			tmpl_obj = Quotation_template.objects.get(pk = int(json_data['id']))

			tmpl_obj.name    = json_data['name']
			tmpl_obj.company = company_id
			tmpl_obj.update_by_user = user_obj

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
			
			if 'expiration_date' in json_data and json_data['expiration_date']!='': 
				tmpl_obj.expiration_date = json_data['expiration_date']


			tmpl_obj.save()

			Quotation_template_record.objects.filter(quotation_template = tmpl_obj).delete()
			
			addProduct(json_data['products'],'order',  tmpl_obj, user_obj, company_id)
			addProduct(json_data['optional_products'],'optional', tmpl_obj, user_obj, company_id)

			data['success'] = True

		except Quotation_template.DoesNotExist:
			data['success'] = False

	return HttpResponse(json.dumps(data), content_type="application/json")



def addProduct(products, line_type, tmpl_obj, user_obj, company_id):
	for pro in products:
		product_data = formatFields(pro['product_raw'])

		if product_data['pro_id'] is not None and product_data['pro_id']!='' :

			qtr_obj = Quotation_template_record()

			qtr_obj.quotation_template = tmpl_obj
			qtr_obj.discription    = product_data['pro_discription']
			qtr_obj.Product_id = product_data['pro_id']
			qtr_obj.company = company_id
			qtr_obj.create_by_user = user_obj
			qtr_obj.product_qty    = float(product_data['pro_qty'])
			qtr_obj.product_uom_id = int(product_data['pro_uom']) if product_data['pro_uom']!='' else None
			qtr_obj.discount       = float(product_data['pro_discount'])
			qtr_obj.unit_price     = float(product_data['pro_up'])
			qtr_obj.line_type = line_type 


			if line_type == 'order':
				qtr_obj.Taxes_id       = int(product_data['pro_tax']) if product_data['pro_tax']!='' else None
				qtr_obj.tax_price      = float(product_data['record_tax'])
				qtr_obj.price_subtotal = float(product_data['pro_subtotal'])
				qtr_obj.price_total    = float(product_data['pro_subtotal'])+float(product_data['record_tax'])

			elif line_type == 'optional':
				qtr_obj.tax_price      = float(product_data['record_tax'])
				qtr_obj.price_subtotal = float(product_data['pro_subtotal'])
				qtr_obj.price_total    = float(product_data['pro_subtotal'])+float(product_data['record_tax'])
				
			qtr_obj.save()
		

def formatFields(json_data):
	fields = {}
	for json_obj in json_data:
		fields[json_obj["name"]] = json_obj["value"]
	return fields

def deleteemailtemplate(request):
	return_status = {'success': False, 'msg': ''}
	if request.method == "POST" and request.is_ajax():
		templates = request.POST['templates']
		dic_data = json.loads(templates)
		if len(dic_data) > 0:
			for d in dic_data:
				print("id", d)
				template = EmailTemplate.objects.get(pk=d)
				print("template", template)
				try:
					if template:
						template.delete()
						return_status['success'] = True
				except template.DoesNotExist:
					return_status['msg'] = 'Email template not exits'
		if return_status['success']:
			return_status['msg'] = 'Template Deleted'

	return HttpResponse(json.dumps(return_status), content_type="application/json")
