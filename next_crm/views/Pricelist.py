from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
import json
import os

from django.contrib.auth.models import User
from next_crm.models import Pricelist, Pricelist_item



@login_required(login_url="/login/")
def list(request):
    return render(request, 'web/pricelist/pricelist_app.html')

def listdata(request):
	data              = {}
	company_id        = request.session['company_id']
	user_obj          = request.user
	user_id           = user_obj.id

	currency_list = [{'id':1, 'name':'USD'},{'id':2, 'name':'EUR'}]

	pricelist_list = []

	pricelist_obj = Pricelist.objects.all()

	if len(pricelist_obj)>0:
		for p in pricelist_obj:
			
			currency_name = ''
			if len(currency_list)>0:
				for x in currency_list:
					if x['id'] == p.currency_id:
						currency_name = x['name']

			pricelist_list.append({	'id':p.id,
									'name':p.name,
									'pricelist_type':p.pricelist_type,
									'currency_name': currency_name,
									'active': p.active
								})

	data['pricelist'] = pricelist_list

	return HttpResponse(json.dumps(data), content_type="application/json")

def add(request):
	return render(request, 'web/pricelist/pricelist_app.html')

def adddata(request):
	data              = {}
	company_id        = request.session['company_id']
	user_obj          = request.user
	user_id           = user_obj.id

	currency_list = [{'id':1, 'name':'USD'},{'id':2, 'name':'EUR'}]

	data['currency_json'] = currency_list

	return HttpResponse(json.dumps(data), content_type="application/json")



