from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.db.models import Q
import json
from next_crm.models import Country,Pricing_rules, Quotation_template, Quotation_template_record,Delivery_method

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
def save(request):

	company_id             = request.user.profile.company_id
	user_obj               = request.user
	user_id                = user_obj.id
	fields_data            = {}
	fields_data['success'] = False

	json_data   = json.loads(request.POST['fields'])
	if 'provider' in json_data and json_data['provider'] == 'based_on_rules':
		tmpl_obj = Delivery_method()
		tmpl_obj.name           		= json_data['name']
		tmpl_obj.provider      			= json_data['provider']
		tmpl_obj.margin         		= json_data['margin']
		tmpl_obj.description    		= json_data['description']
		tmpl_obj.company        		= company_id
		tmpl_obj.create_by_user 		= user_obj
		tmpl_obj.save()
		so_id = tmpl_obj.id

		deliverid = (json_data['hiddenid'])
		for json_obj in deliverid:
			json_obj["name"] = json_obj["value"]

			payment = Pricing_rules.objects.filter(pk = json_obj["name"]).update(delivery_id = so_id)
	else:
		tmpl_obj = Delivery_method()
		tmpl_obj.name           		= json_data['name']
		tmpl_obj.provider      			= json_data['provider']
		tmpl_obj.margin         		= json_data['margin']
		tmpl_obj.description    		= json_data['description']
		tmpl_obj.fixed_price_value      = json_data['fixed_price_value']
		tmpl_obj.order_value    		= json_data['order_value']
		tmpl_obj.order_check    		= json_data['order_check']
		tmpl_obj.company        		= company_id
		tmpl_obj.create_by_user 		= user_obj
		tmpl_obj.save()
		so_id = tmpl_obj.id

	fields_data['success'] = True

	return HttpResponse(json.dumps(fields_data), content_type="application/json")

@login_required(login_url="/login/")
def listdata(request):
	data         = {}
	company_id   = request.user.profile.company_id
	user_obj     = request.user
	user_id      = user_obj.id
	delivery_list = []
	can_remove = True

	limit  = settings.PAGGING_LIMIT
	offset = ""

	if request.method=="POST":
		json_data = json.loads(request.POST['fields'])
		parameter = formatFields(json_data)

		names = json.loads(request.POST['names'])

		offset = int(parameter['offset'])
		limit = offset+int(limit)

		orderby = 'id'

		delivery = Delivery_method.objects.filter(company = company_id)
		like_cond = Q()
		if len(names)>0:
			orderby = 'name'
			for name in names:
				like_cond = like_cond |Q(name__icontains = name)

			delivery = delivery.filter(like_cond)

		total_delivery = len(delivery)

		delivery = delivery.order_by(orderby)
		delivery = delivery[offset:limit]

		data['total_count'] = total_delivery

		for o in delivery:
			delivery_list.append({
				'id':o.id,
				'name':o.name,
				'can_remove' :can_remove
                    })
	data['delivery'] = delivery_list
	return HttpResponse(json.dumps(data), content_type="application/json")

@login_required(login_url="/login/")
def viewdata(request, view_id):
	
	data       = {}
	company_id = request.user.profile.company_id
	user_obj   = request.user

	data['success'] = False

	try:
		qt = Delivery_method.objects.get(pk = view_id)

		delivery = {'id':qt.id , 
					'name': qt.name,
					'provider': qt.provider,
					'margin': qt.margin,
					'description': qt.description,
					'fixed_price_value': qt.fixed_price_value, 
					'order_value': qt.order_value,
					'order_check': qt.order_check,
					}

		data['delivery'] = delivery
		data['success'] = True

	except Delivery_method.DoesNotExist:
		data['success'] = False

	data['success'] = True

	return HttpResponse(json.dumps(data), content_type="application/json") 

@login_required(login_url="/login/")
def editdata(request, edit_id):
	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user


	try:
		qt = Delivery_method.objects.get(pk = edit_id)

		delivery = {'id':qt.id , 
					'name': qt.name,
					'provider': qt.provider,
					'margin': qt.margin,
					'description': qt.description,
					'fixed_price_value': qt.fixed_price_value, 
					'order_value': qt.order_value,
					'order_check': qt.order_check, 
					}


		data['delivery'] = delivery
		data['success'] = True

	except Delivery_method.DoesNotExist:
		data['success'] = False

	data['success'] = True


	return HttpResponse(json.dumps(data), content_type = "application/json")

@login_required(login_url="/login/")
def update(request):
	company_id             = request.user.profile.company_id
	user_obj               = request.user
	user_id                = user_obj.id
	fields_data            = {}
	fields_data['success'] = False

	json_data   = json.loads(request.POST['fields'])

	if 'provider' in json_data and json_data['provider'] == 'based_on_rules':
		tmpl_obj =  Delivery_method.objects.get(pk = int(json_data['id']))
		tmpl_obj.name           		= json_data['name']
		tmpl_obj.provider      			= json_data['provider']
		tmpl_obj.margin         		= json_data['margin']
		tmpl_obj.description    		= json_data['description']
		tmpl_obj.company        		= company_id
		tmpl_obj.create_by_user 		= user_obj
		tmpl_obj.save()
		so_id = json_data['id']

		deliverid = (json_data['hiddenid'])
		for json_obj in deliverid:
			json_obj["name"] = json_obj["value"]

			payment = Pricing_rules.objects.filter(pk = json_obj["name"]).update(delivery_id = so_id)
	else:
		tmpl_obj = Delivery_method.objects.get(pk = int(json_data['id']))
		tmpl_obj.name           		= json_data['name']
		tmpl_obj.provider      			= json_data['provider']
		tmpl_obj.margin         		= json_data['margin']
		tmpl_obj.description    		= json_data['description']
		tmpl_obj.fixed_price_value      = json_data['fixed_price_value']
		tmpl_obj.order_value    		= json_data['order_value']
		tmpl_obj.order_check    		= json_data['order_check']
		tmpl_obj.company        		= company_id
		tmpl_obj.create_by_user 		= user_obj
		tmpl_obj.save()
		so_id = json_data['id']

	fields_data['success'] = True

	return HttpResponse(json.dumps(fields_data), content_type="application/json")


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields 

def deletedelivery(request):
	data = {}
	data['success'] = False

	id_list  = json.loads(request.POST['ids'])

	if len(id_list)>0:
		for i in id_list:
			try:
				quot_obj = Delivery_method.objects.get(pk=int(i)).delete()
			except quot_obj.DoesNotExist:
				pass

		data['success'] = True

	return HttpResponse(json.dumps(data), content_type= 'application/json')

def deletepricingrules(request):
	data = {}
	data['success'] = False

	id_list  = json.loads(request.POST['ids'])

	quot_obj = Pricing_rules.objects.get(pk=int(id_list)).delete()

	data['success'] = True

	return HttpResponse(json.dumps(data), content_type= 'application/json')

def savepricingrules(request):

	company_id             = request.user.profile.company_id
	user_obj               = request.user
	user_id                = user_obj.id
	fields_data            = {}
	fields_data['success'] = False

	json_data   = json.loads(request.POST['fields'])
	fields_data = formatFields(json_data)

	if 'condition_varible' in fields_data and fields_data['condition_varible']!='':
		tmpl_obj = Pricing_rules()

		tmpl_obj.condition_varible    	= fields_data['condition_varible']
		tmpl_obj.condition_oprators    	= fields_data['condition_oprators']

		if 'condition_price' in fields_data and (fields_data['condition_price']) != "":
			
			tmpl_obj.condition_price = fields_data['condition_price']

		else:

			tmpl_obj.condition_price = 0.00

		if 'sale_price_1' in fields_data and (fields_data['sale_price_1']) != "":
			
			tmpl_obj.sale_price_1 = fields_data['sale_price_1']
			
		else:

			tmpl_obj.sale_price_1 = 0.00

		if 'sale_price_2' in fields_data and (fields_data['sale_price_2']) != "":
			
			tmpl_obj.sale_price_2 = fields_data['sale_price_2']

		else:
			
			tmpl_obj.sale_price_2 = 0.00

		tmpl_obj.sale_price_varible    	= fields_data['sale_price_varible']
		tmpl_obj.company 				= company_id
		tmpl_obj.create_by_user 		= user_obj
		tmpl_obj.save()
		so_id = tmpl_obj.id

		fields_data['success']  = True
		fields_data['id'] 		= so_id

	return HttpResponse(json.dumps(fields_data), content_type= 'application/json')

def getpricingData(request,price_id):

	data = {}
	data['success'] = False
	qout_tmpl =[]

	tpml_obj = Pricing_rules.objects.filter(delivery_id = price_id)
	if len(tpml_obj):
		for o in tpml_obj:
			qout_tmpl.append({
				'id'          			: o.id, 
				'condition_varible'     : o.condition_varible,
				'condition_price'       : o.condition_price,
				'sale_price_1'          : o.sale_price_1,
				'sale_price_2'          : o.sale_price_2,
				'condition_oprators'    : o.condition_oprators,
				'sale_price_2'          : o.sale_price_2,
				})
			if len(qout_tmpl)>0:
				data['rule'] = qout_tmpl
				data['success'] = True
	
	return HttpResponse(json.dumps(data), content_type="application/json")


@login_required(login_url="/login/")
def adddata(request):
    company_id  = request.user.profile.company_id
    user_obj    = request.user
    user_id     = user_obj.id
    data        = {}

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    data['company_id']         = company_id
    data['user_id']            = user_id
    data['roles']= roles

    data['json_country'] = getCountry()

    return HttpResponse(json.dumps(data), content_type="application/json") 



def getCountry():

    con_list = []

    users_obj = Country.objects.all()

    for o in users_obj:
        con_list.append({'id':o.id,
                        'name':o.name})

    return con_list


def addCountry(request):

  response = {}
  company_id      = request.user.profile.company_id
  response['success'] = False
  data_field = json.loads(request.POST['field'])
  data_field = formatFields(data_field)

  try:
     
      if Country.objects.filter(name=data_field['country'],company = company_id).count()==0:
                country = Country()
                country.company = company_id
                country.name = data_field['country'] 
                country.save()
      else:
            country = Country.objects.get(name=data_field['country'],company = company_id)
            country.name = data_field['country']
            country.company = company_id
            country.save()
      
      response['success'] = True
      response['country'] = {'id':country.id, 'name': country.name}

  except Country.DoesNotExist:
        print('Country doest not filed') 
  return  HttpResponse(json.dumps(response), content_type = "application/json")
