from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.db.models import Q
import json
from next_crm.models import Quotation_template,Quotation_template_record,Product_unit_of_measure,Delivery_method

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
def listdata(request):
	data         = {}
	company_id   = request.user.profile.company_id
	user_obj     = request.user
	user_id      = user_obj.id
	unit_list = []
	can_remove = True

	limit  = settings.PAGGING_LIMIT
	offset = ""

	if request.method=="POST":
		json_data = json.loads(request.POST['fields'])
		parameter = formatFields(json_data)

		names = json.loads(request.POST['names'])

		offset = int(parameter['offset'])
		limit = offset+int(limit)

		orderby = '-id'

		unit = Product_unit_of_measure.objects.filter(company = company_id)


		like_cond = Q()
		if len(names)>0:
			orderby = 'name'
			for name in names:
				like_cond = like_cond |Q(name__icontains = name)

			unit = unit.filter(like_cond)

		total_unit = len(unit)

		unit = unit.order_by(orderby)
		unit = unit[offset:limit]

		data['total_count'] = total_unit


		for o in unit:
			unit_list.append({
				'id':o.id,
				'name':o.name,
			
				'can_remove' :can_remove
                    })
	data['unit'] = unit_list
	return HttpResponse(json.dumps(data), content_type="application/json")

@login_required(login_url="/login/")
def viewdata(request, view_id):
	
	data       = {}
	company_id = request.user.profile.company_id
	user_obj   = request.user

	data['success'] = False
	op_id_list = getOpIdList(request , company_id)
	if len(op_id_list)>0:
		data['op_id_list'] = op_id_list

	try:
		qt = Product_unit_of_measure.objects.get(pk = view_id)

		category_name = ''
		category_id   = ''
		if  qt.category is not None:
			category_id   = qt.category_id
			category_name = qt.category.name
		unit = {'id':qt.id , 
					'name': qt.name,
					'category_name' : category_name,
					'category_id' : category_id,
					'uom_type'    :qt.uom_type,
					}

		data['unit'] = unit
		data['success'] = True

	except Product_unit_of_measure.DoesNotExist:
		data['success'] = False

	data['success'] = True

	return HttpResponse(json.dumps(data), content_type="application/json") 

def getOpIdList(request , company_id):

    op_id_list = []
    op_objs = Product_unit_of_measure.objects.filter(company = company_id).order_by('id')

    for op in op_objs:
        op_id_list.append({'id':op.id})

    return op_id_list
    
@login_required(login_url="/login/")
def editdata(request, edit_id):
	data = {}
	data['success'] = False
	company_id      = request.user.profile.company_id
	user_obj        = request.user


	try:
		qt = Product_unit_of_measure.objects.get(pk = edit_id)

		category_name = ''
		category_id   = ''
		if  qt.category is not None:
			category_id   = qt.category_id
			category_name = qt.category.name

		unit = {'id':qt.id , 
					'name': qt.name,
					'category_name' : category_name,
					'category_id' : category_id,
					'uom_type'    :qt.uom_type,
					}
		data['unit'] = unit
		data['success'] = True

	except Product_unit_of_measure.DoesNotExist:
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
	fields_data = formatFields(json_data)

	if 'id' in fields_data and int(fields_data['id'])>0 and 'name' in fields_data and fields_data['name']!='':

		try:
			tmpl_obj = Delivery_method.objects.get(pk = int(fields_data['id']))

			tmpl_obj.name    = fields_data['name']
			tmpl_obj.company = company_id
			tmpl_obj.update_by_user = user_obj
			tmpl_obj.save()
			fields_data['success'] = True

		except Delivery_method.DoesNotExist:
			fields_data['success'] = False

	return HttpResponse(json.dumps(fields_data), content_type="application/json")


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields 

def deleteunit(request):
	data = {}
	data['success'] = False

	id_list  = json.loads(request.POST['ids'])

	if len(id_list)>0:
		for i in id_list:
			try:
				quot_obj = Product_unit_of_measure.objects.get(pk=int(i)).delete()
			except quot_obj.DoesNotExist:
				pass

		data['success'] = True

	return HttpResponse(json.dumps(data), content_type= 'application/json')
