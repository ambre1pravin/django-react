from django.shortcuts import render
from django.http import HttpResponse
from datetime import time
from django.contrib.auth.decorators import login_required
from django.core.files.storage import FileSystemStorage
from next_crm.helper.utils import Utils
from django.conf import settings
import json, os, time, csv
from next_crm.models import Product,Profile,SalesChannel,Product_template,Sale_order,Sale_order_record,Product_category, Product_unit_of_measure,  Product_taxes, Product_cost_history, Product_uom_category
from django.db.models import Q
from next_crm.helper.file_helper import upload_file
from django.views.decorators.csrf import csrf_exempt
from next_crm.helper.company import get_currency_name


@login_required(login_url="/login/")
def list(request):
    return render(request, 'web/app.html')

def listdata(request):
    data         = {}
    company_id   = request.user.profile.company_id
    user_obj     = request.user
    user_id      = user_obj.id
    product_list = []

    limit  = settings.PAGGING_LIMIT
    offset = ""
    data['currency'] = get_currency_name(company_id)
    if request.method=="POST":
        json_data = json.loads(request.POST['fields'])
        parameter = formatFields(json_data)

        names = json.loads(request.POST['names'])

        offset = int(parameter['offset'])
        limit = offset+int(limit)

        orderby = '-id'

        products = Product.objects.filter(company = company_id).order_by('id')

        like_cond = Q()
        if len(names)>0:
            orderby = 'template_name'
            for name in names:     
                like_cond = like_cond |Q(template_name__icontains = name)

            products = products.filter(like_cond)

        total_product = len(products)
        product_taxes_temp = Product_taxes.objects.filter(company_id = company_id,is_default = True)
        if len(product_taxes_temp) < 1:
            tmpl_obj = Product_taxes()
            tmpl_obj.name            = '20 % Taxes'
            tmpl_obj.value           =  20
            tmpl_obj.computation     = 'Percentage'
            tmpl_obj.scope           = 'sale'
            tmpl_obj.company_id         = company_id
            tmpl_obj.user_id         = user_id
            tmpl_obj.create_by       = user_obj
            tmpl_obj.is_default      = True
            tmpl_obj.save()
        products = products.order_by(orderby)        
        products = products[offset:limit]

        data['total_count'] = total_product
        for o in products:
                product_type     = ''
                sale_price       = ''
                product_category = ''
                product_cost     = ''

                try:
                    product_tmpl = Product_template.objects.get(pk=o.product_tmpl_id)
                except Product_template.DoesNotExist:
                    product_tmpl = None

                if product_tmpl is not None:
                    product_type = product_tmpl.product_type.title()
                    sale_price   = product_tmpl.sale_price

                    if product_tmpl.id is not None:

                        try:
                            cost_obj  = Product_cost_history.objects.filter(product = product_tmpl.id).last()
                            if cost_obj is not None and cost_obj !='':
                                if cost_obj.cost is not None and cost_obj.cost !='':
                                    product_cost = cost_obj.cost
                                else:
                                    product_cost  = ''
                            else:
                                product_cost  = ''
                        except Product_cost_history.DoesNotExist:
                                product_cost  = ''
                        

                    if product_tmpl.product_category is not None:
                        try:
                            pro_category = Product_category.objects.get(pk=product_tmpl.product_category_id)
                        except Product_category.DoesNotExist:
                            pro_category = None

                        if pro_category is not None:
                            product_category = getProParentCate(pro_category)

                product_list.append({
                                'id':o.id,
                                'uuid': str(o.uuid),
                                'name':o.template_name,
                                'product_type': product_type,
                                'internal_reference':o.internal_reference,
                                'product_category': product_category,
                                'sale_price': sale_price,
                                'cost': product_cost
                    })
    
    data['products'] = product_list

    return HttpResponse(json.dumps(data), content_type="application/json")

def getlistdata(request):
    data         = {}
    company_id   = request.user.profile.company_id
    user_obj     = request.user
    user_id      = user_obj.id
    product_list = []

    products = Product.objects.filter(company = company_id).order_by('id')

    if  len(products)>0:
        for pro in products:
            sale_price       = ''
            try:
                product_tmpl = Product_template.objects.get(pk=pro.product_tmpl_id)
            except Product_template.DoesNotExist:
                product_tmpl = None
            
            if product_tmpl is not None:
                sale_price   = product_tmpl.sale_price


            product_list.append({'id':pro.id,'uuid': str(pro.uuid),
                            'name' : pro.template_name,
                            'internal_reference' : pro.internal_reference,
                            'sale_price' : sale_price 
                })

    if len(product_list) > 0:
        data['products'] = product_list

    return HttpResponse(json.dumps(data), content_type="application/json")

def add(request):
    return render(request, 'web/app.html')

def Paginglimit(request):
    company_id = request.user.profile.company_id
    user_obj   = request.user
    user_id    = user_obj.id
    data       = {}
    limit  = settings.PAGGING_LIMIT

    data['limit'] = limit

    return HttpResponse(json.dumps(data), content_type="application/json")
def add(request):
    return render(request, 'web/app.html')

def adddata(request):
    company_id = request.user.profile.company_id
    user_obj   = request.user
    user_id    = user_obj.id
    data       = {}
    data['currency'] = get_currency_name(company_id)
    json_taxes = getTaxes(company_id)

    if len(json_taxes)>0:
        data['json_taxes'] = json_taxes

    if 'current_sales_team' in request.session:
        sales_team_id = request.session['current_sales_team']
    else:
        sales_team_id = None

    data['tax_on_sale'] = ''
    data['tax_on_sale_name'] = ''

    sales_team_dict = getTeamOfUser(company_id, user_obj)
    sales_team_list  = []
    if sales_team_dict is not None:
        for sales_team_obj in sales_team_dict:
            sales_team_list.append({'id':sales_team_obj['id'],'name':sales_team_obj['name']})
            if sales_team_id is not None and sales_team_obj['id'] == int(sales_team_id):
                data['currentsalesTeam']   = sales_team_obj['name']
                data['currentsalesTeamId'] = sales_team_obj['id']

    if len(sales_team_list)>0:
        data['json_teams'] = sales_team_list
    data['json_users'] = getCompanyUser(company_id)
    data['json_users'] = [{'id':user_id, 'name':user_obj.username}]

    json_pro_cate = getProCategory(company_id)
    if len(json_pro_cate)>0:
        data['json_product_cate'] = json_pro_cate

    json_uom = getUOM(company_id)
    if len(json_uom)>0:
        data['json_uom'] = json_uom

    return HttpResponse(json.dumps(data), content_type="application/json")


def getTeamOfUser(company_id, user_obj):

    sales_teams = SalesChannel.objects.values().filter(company = company_id)

    return sales_teams


def getCompanyUser(company_id):

    users_data = []

    users_obj = Profile.objects.filter(company_id= company_id)

    for o in users_obj:
        users_data.append({'id':o.user.id,
                        'name':o.user.username})

    return users_data

# it returns product caegory object list like [{'id':1, 'name':'All / Electric / Mobile'}]
def getProCategory(company_id):
    pro_cate_list = []
    pro_cate_objs = Product_category.objects.filter(company = company_id)

    for product_cate in pro_cate_objs:
        pro_cate_list.append({'id':product_cate.id, 'name':getProParentCate(product_cate)}) 

    return pro_cate_list
    
# it return name of product category with perent category name like  All / Electric / Mobile
def getProParentCate(product_obj):
    product_obj_name = product_obj.name
    if product_obj.parent is not None:
        name  = str(product_obj.parent) +' / '+ str(product_obj.name)
        return name
    else :
        return product_obj_name

def getUOM(company_id):
    uom_list  = []

    uom_objs = Product_unit_of_measure.objects.filter(company = company_id)

    for uom in uom_objs:
        uom_list.append({'id': uom.id,
                         'name' : uom.name
                                })

    return uom_list


def save(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    response = {'success': False, 'message': '', 'result': []}
    json_data = json.loads(request.POST['post_data'])

    if 'product_name' in json_data and json_data['product_name']!='':

        product_tmpl_obj = Product_template()

        product_tmpl_obj.name = json_data['product_name']

        if 'can_be_sold' in json_data and json_data['can_be_sold']:
            product_tmpl_obj.can_be_sold = True
        else:
            product_tmpl_obj.can_be_sold = False

        if 'can_be_purchased' in json_data and json_data['can_be_purchased']:
            product_tmpl_obj.can_be_purchased = True
        else:
            product_tmpl_obj.can_be_purchased = False

        if 'can_be_expend' in json_data and json_data['can_be_expend']:
            product_tmpl_obj.can_be_expended = True
        else:
            product_tmpl_obj.can_be_expended = False

        if 'event_subscription' in json_data and json_data['event_subscription']:
            product_tmpl_obj.event_subscription = True
        else:
            product_tmpl_obj.event_subscription = False

        if 'product_type' in json_data and json_data['product_type'] is not None and json_data['product_type'] in ['consumable', 'service', 'stockable']:
            product_tmpl_obj.product_type = json_data['product_type']

        if 'product_category' in json_data and json_data['product_category']:
            product_tmpl_obj.product_category_id = int(json_data['product_category'])

        if 'sale_price' in json_data and json_data['sale_price']:
            product_tmpl_obj.sale_price = json_data['sale_price']

        if 'tax_on_sale' in json_data and json_data['tax_on_sale']:
            product_tmpl_obj.tax_on_sale_id = int(json_data['tax_on_sale'])

        if 'unit_of_measure' in json_data and json_data['unit_of_measure']:
            product_tmpl_obj.uofm_id = json_data['unit_of_measure']

        if 'discription' in json_data and json_data['discription']:
            product_tmpl_obj.description = json_data['discription']

        if 'wholesale_tax' in json_data and json_data['wholesale_tax']!='':
            product_tmpl_obj.wholesale_tax_id = int(json_data['wholesale_tax'])

        if 'volume' in  json_data and json_data['volume']:
            product_tmpl_obj.volume = json_data['volume']
        
        if 'weight' in  json_data and json_data['weight']:
            product_tmpl_obj.weight = json_data['weight']

        if 'internal_note' in json_data and json_data['internal_note']:
            product_tmpl_obj.notes = json_data['internal_note']

        if 'sales_person' not in json_data and json_data['sales_person']:
            product_tmpl_obj.sales_person = int(json_data['sales_person'])
        else:
            product_tmpl_obj.sales_person  = user_id

        if 'sales_channel' not in json_data and json_data['sales_channel']:
            product_tmpl_obj.sales_channel_id = json_data['sales_channel']

        if 'internal_note_for_vendor' in json_data and json_data['internal_note_for_vendor']:
            product_tmpl_obj.vendors_notes = json_data['internal_note_for_vendor']

        product_tmpl_obj.create_by_user = user_obj
        product_tmpl_obj.company_id = company_id
        product_tmpl_obj.save()

        if product_tmpl_obj.id > 0:
            product_obj = Product()
            product_obj.product_tmpl   = product_tmpl_obj
            product_obj.template_name  = json_data['product_name']
            product_obj.create_by_user = user_obj
            product_obj.company_id     = company_id

            if 'sales_person' not in json_data :
                product_obj.sales_person_id  = user_id
            elif 'sales_person' in json_data and json_data['sales_person'] and json_data['sales_person'] is not None:
                product_obj.sales_person_id = int(json_data['sales_person'])

            if 'sales_channel' not in json_data :
                product_obj.sales_channel_id  = json_data['sales_channel']
            elif 'sales_channel' in json_data and json_data['sales_channel'] and json_data['sales_channel'] is not None:
                product_obj.sales_channel_id  = int(json_data['sales_channel'])

            if 'volume' in  json_data and json_data['volume']:
                product_obj.volume = json_data['volume']
        
            if 'weight' in  json_data and json_data['weight']:
                product_obj.weight = json_data['weight']

            if 'internal_ref' in  json_data and json_data['internal_ref']:
                product_obj.internal_reference = json_data['internal_ref']

            if 'img_url' in  json_data and json_data['img_url']!='':
                product_obj.image_path = json_data['img_url']

            product_obj.save()

            if product_obj.id > 0:
                cost_obj = Product_cost_history()
                cost_obj.product = product_tmpl_obj
                if 'cost' in json_data and json_data['cost']:
                    cost_obj.cost = json_data['cost']
                cost_obj.company_id =  company_id
                cost_obj.save()
            if product_obj.id > 0:
                response['result'] = {'id': product_obj.id, 'name': product_obj.template_name,'uuid':str(product_obj.uuid)}
                response['success'] = True
    else:
        response['success'] = False
    return HttpResponse(json.dumps(response), content_type="application/json")


def update(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    response = {'success': False, 'message': '', 'result': []}
    json_data = json.loads(request.POST['post_data'])
    product_obj = Product.objects.get(uuid=json_data['id'])
    product_obj.template_name = json_data['product_name']
    product_obj.update_by_user = user_obj

    if 'sales_channel' in json_data and json_data['sales_channel']:
        product_obj.sales_channel_id = json_data['sales_channel']

    if 'sales_person' in json_data and json_data['sales_person']:
        product_obj.sales_person_id = json_data['sales_person']

    if 'weight' in json_data and json_data['weight']:
        product_obj.weight = json_data['weight']

    if 'volume' in json_data and json_data['volume']:
        product_obj.volume = json_data['volume']

    if 'internal_ref' in json_data:
        product_obj.internal_reference = json_data['internal_ref']

    if 'img_url' in json_data:
        product_obj.image_path = json_data['img_url']

    product_obj.save()

    product_tmpl_obj = Product_template.objects.get(pk=product_obj.product_tmpl_id)

    if 'product_name' in json_data and json_data['product_name']:
        product_tmpl_obj.name = product_obj.template_name

        if 'can_be_sold' in json_data and json_data['can_be_sold']:
            product_tmpl_obj.can_be_sold = True
        else:
            product_tmpl_obj.can_be_sold = False

        if 'can_be_purchased' in json_data and json_data['can_be_purchased']:
            product_tmpl_obj.can_be_purchased = True
        else:
            product_tmpl_obj.can_be_purchased = False

        if 'can_be_expend' in json_data and json_data['can_be_expend']:
            product_tmpl_obj.can_be_expended = True
        else:
            product_tmpl_obj.can_be_expended = False

        if 'event_subscription' in json_data and json_data['event_subscription']:
            product_tmpl_obj.event_subscription = True
        else:
            product_tmpl_obj.event_subscription = False

        if 'product_type' in json_data and json_data['product_type'] is not None and json_data['product_type'] in [
            'consumable', 'service', 'stockable']:
            product_tmpl_obj.product_type = json_data['product_type']

        if 'product_category' in json_data and json_data['product_category']:
            product_tmpl_obj.product_category_id = int(json_data['product_category'])

        if 'sale_price' in json_data and json_data['sale_price']:
            product_tmpl_obj.sale_price = json_data['sale_price']

        if 'tax_on_sale' in json_data and json_data['tax_on_sale']:
            product_tmpl_obj.tax_on_sale_id = int(json_data['tax_on_sale'])

        if 'unit_of_measure' in json_data and json_data['unit_of_measure']:
            product_tmpl_obj.uofm_id = json_data['unit_of_measure']

        if 'discription' in json_data and json_data['discription']:
            product_tmpl_obj.description = json_data['discription']

        if 'wholesale_tax' in json_data and json_data['wholesale_tax'] != '':
            product_tmpl_obj.wholesale_tax_id = int(json_data['wholesale_tax'])

        if 'volume' in json_data and json_data['volume']:
            product_tmpl_obj.volume = json_data['volume']

        if 'weight' in json_data and json_data['weight']:
            product_tmpl_obj.weight = json_data['weight']

        if 'internal_note' in json_data and json_data['internal_note']:
            product_tmpl_obj.notes = json_data['internal_note']

        if 'sales_person' not in json_data and json_data['sales_person']:
            product_tmpl_obj.sales_person_id = int(json_data['sales_person'])
        else:
            product_tmpl_obj.sales_person = user_id

        if 'sales_channel' in json_data and json_data['sales_channel']:
            product_tmpl_obj.sales_channel_id = json_data['sales_channel']

        if 'internal_note_for_vendor' in json_data and json_data['internal_note_for_vendor']:
            product_tmpl_obj.vendors_notes = json_data['internal_note_for_vendor']

        product_tmpl_obj.save()

        # update cost history table
        cost_obj = Product_cost_history()
        cost_obj.product = product_tmpl_obj

        if 'cost' in json_data and json_data['cost']:
            cost_obj.cost = json_data['cost']

        cost_obj.company_id = company_id
        cost_obj.save()

        if product_obj.id > 0:
            response['result'] = {'id': product_obj.id, 'name': product_obj.template_name, 'uuid': str(product_obj.uuid)}
            response['success'] = True
    else:
        response['success'] = False

    return HttpResponse(json.dumps(response), content_type="application/json")


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields

def categorysave(request):
    data = {}
    data['success'] = False
    company_id      = request.user.profile.company_id
    user_obj        = request.user
    response = {'success': False, 'message': '', 'result': []}
    json_data   = json.loads(request.POST['post_data'])

    if 'category_id' in json_data and json_data['category_id'] !='' and int(json_data['category_id']) > 0:
        product_category = Product_category.objects.get(pk = json_data['category_id'])
    else:
        product_category = Product_category()

    product_category.name = json_data['category_name']

    if 'parent_category_id' in json_data and json_data['parent_category_id']!='' and json_data['parent_category_id']!=0 and json_data['parent_category_id']!= None:
        product_category.parent_id = int(json_data['parent_category_id'])

    product_category.user = user_obj
    product_category.company_id = company_id

    product_category.save()

    if product_category.id > 0:
        name = product_category.name
        if product_category.parent:
            name = str(product_category.parent.name) + ' / ' + str(product_category.name)
        response['result'] = {'id': product_category.id, 'name': name}
        response['success'] = True
    return HttpResponse(json.dumps(response), content_type="application/json")

def categorydataByid(request, cate_id):
    data = {}
    data['success'] = False

    try:
        pro_category = Product_category.objects.get(pk=cate_id)
        data['category_name'] = pro_category.name

        if pro_category.parent is not None:
            data['parent_id'] = pro_category.parent_id
            data['parent_name'] = getProParentCate(pro_category.parent)
        data['success'] = True

    except Product_category.DoesNotExist:
        pro_category = None

    return HttpResponse(json.dumps(data), content_type="application/json")

def getCategory(request):
    company_id    = request.user.profile.company_id
    data ={}
    data['success'] = False
    json_pro_cate = getProCategory(company_id)

    if(len(json_pro_cate)>0):
        data['json_cate_list'] = json_pro_cate


    return HttpResponse(json.dumps(data), content_type="application/json")

def getUomCategory(request):
    company_id =request.user.profile.company_id
    user_obj    = request.user
    user_id     = user_obj.id
    data        = {}

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    data['company_id']         = company_id
    data['user_id']            = user_id
    data['roles'] = roles
    data['json_uom_category'] = getuomCategory(company_id)


    return HttpResponse(json.dumps(data), content_type="application/json")


def getuomCategory(company_id):
    uom_cate_list = []
    uom_cate_objs = Product_uom_category.objects.filter(company = company_id)

    for uom_cate in uom_cate_objs:
        uom_cate_list.append({'id':uom_cate.id, 'name':uom_cate.name}) 

    return uom_cate_list

def getUomCById(request, uom_id):
    data = {}
    data['success'] = False

    try:
        pro_uom = Product_unit_of_measure.objects.get(pk=uom_id)
        
        data['name']          = pro_uom.name
        data['uom_type']      = pro_uom.uom_type

        if pro_uom.uom_type == 'bigger':
            data['ratio'] = float("{0:.10f}".format(1/pro_uom.factor))


        elif pro_uom.uom_type == 'smaller':
            data['ratio'] = pro_uom.factor
        else :
            data['ratio'] = pro_uom.factor

        data['category_id']   = ''
        data['category_name'] = ''

        if pro_uom.category is not None:
            data['category_id']   = pro_uom.category_id
            data['category_name'] = pro_uom.category.name

        data['success'] = True

    except Product_unit_of_measure.DoesNotExist:
        pro_uom = None

    return HttpResponse(json.dumps(data), content_type="application/json")

def saveUOM(request):
    company_id = request.user.profile.company_id
    user_obj   = request.user
    response = {'success': False, 'message': '', 'result': []}
    json_data   = json.loads(request.POST['post_data'])

    if 'uom_id' in json_data and int(json_data['uom_id'])!=0:
        uom_obj = Product_unit_of_measure.objects.get(pk=int(json_data['uom_id']))
    else:
        uom_obj = Product_unit_of_measure()

    uom_obj.name = json_data['uom_name']
    #uom_obj.category_id = json_data['uom_category_id']
    uom_obj.create_by = user_obj
    uom_obj.company_id = company_id

    uom_obj.save()

    if uom_obj.id > 0:
        response['result'] = {'id': uom_obj.id, 'uom_name': uom_obj.name,
                              'uom_category_id': uom_obj.category_id
                              }
        response['success'] = True

    return HttpResponse(json.dumps(response), content_type="application/json")



def uomCateByid(request, uom_cate_id):
    data = {}
    data['success'] = False

    try:
        pro_uom_cate = Product_uom_category.objects.get(pk=uom_cate_id)
        data['name'] = pro_uom_cate.name
        data['success'] = True

    except Product_uom_category.DoesNotExist:
        pro_uom = None

    return HttpResponse(json.dumps(data), content_type="application/json")

def saveUOMCate(request):

    company_id = request.user.profile.company_id
    user_obj   = request.user
    response = {'success': False, 'message': '', 'result': []}
    post_data   = json.loads(request.POST['post_data'])

    if 'uom_cat_id' in post_data and int(post_data['uom_cat_id'])!=0:
        uom_cate_obj = Product_uom_category.objects.get(pk=int(post_data['uom_cat_id']))
        uom_cate_obj.update_uid = user_obj

    else:
        try:
            uom_cate_obj = Product_uom_category.objects.get(name__exact=str(post_data['name']), company_id=company_id)
            response['message'] = 'Template with same name already exits.'
        except Product_uom_category.DoesNotExist as e:
            uom_cate_obj = Product_uom_category()
            uom_cate_obj.create_uid = user_obj
            uom_cate_obj.update_uid = user_obj
            response['message'] = ' Category Created!'

    uom_cate_obj.name         = post_data['name']
    uom_cate_obj.company_id = company_id
    uom_cate_obj.save()
    response['success'] = True
    response['result'] = {'id': uom_cate_obj.id, 'name': uom_cate_obj.name}

    return HttpResponse(json.dumps(response), content_type="application/json")

# product view page 
@login_required(login_url="/login/")
def view(request, id):
    return render(request, 'web/app.html')


def viewdata(request, uuid):

    company_id = request.user.profile.company_id
    data = {'success':False,'currency':get_currency_name(company_id),'total_engage_cost':''}
    try:
        res = Product.objects.get(uuid=uuid, company_id=company_id)
        if res:
            pro_id = res.id

            if getProductFields(pro_id) is not None:
                data['product'] = getProductFields(pro_id)
                data['total_engage_cost'] = "{0:.2f}".format(get_product_total_invoice_cost(pro_id))
                data['success'] = True
            else:
                data['success'] = False
    except Product.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type="application/json")

def get_product_total_invoice_cost(product_id):
    total = 0.00
    sales_order = Sale_order_record.objects.select_related('invoice').filter(Product_id=product_id, invoice_id__isnull=False, invoice__status='open')
    if sales_order:
        for order in sales_order:
            print("invoice", order.invoice.status)
            print("ordr", order.price_subtotal)
            total = total + float(order.price_subtotal)
    return total


def getOpIdList(request , company_id):
    op_id_list = []
    op_objs = Product.objects.filter(company = company_id).order_by('id')
    for op in op_objs:
        op_id_list.append({'id':op.id})
    return op_id_list

def getProductFields(id):
   
    try:
        products_qset = Product.objects.get(id = id)
        sales_person_name=None
        sales_person_id=None
        sales_channel_name=None
        sales_channel_id=None
    
        if products_qset is not None:
            product_template = products_qset.product_tmpl

            category_name = ''
            if product_template.product_category is not None:
                    category_name = getProParentCate(product_template.product_category)
    
            cost = ''
            try:
                cost_obj  = Product_cost_history.objects.filter(product = product_template).last()
                if cost_obj is not None and cost_obj !='':
                    if cost_obj.cost is not None and cost_obj.cost !='':
                        cost = cost_obj.cost
                    else:
                        cost  = ''

            except Product_cost_history.DoesNotExist:
               cost  = ''

            uofm_name = ''
            if product_template.uofm is not None:
                uofm_name = product_template.uofm.name

            purchase_uofm_name = ''
            if product_template.purchase_uofm is not None:
                purchase_uofm_name = product_template.purchase_uofm.name

            tax_on_sale_name = ''
            if product_template.tax_on_sale is not None:
                tax_on_sale_name = product_template.tax_on_sale.name
            
            wholesale_name = ''
            if product_template.wholesale_tax is not None:
                wholesale_name = product_template.wholesale_tax.name

            image_path = '/media/product_img/image-upload.png'
            if products_qset.image_path is not None and products_qset.image_path!='':
                 image_path = products_qset.image_path

            if products_qset.sales_person:
                sales_person_name = products_qset.sales_person.email
                sales_person_id = products_qset.sales_person_id

            if products_qset.sales_channel_id:
                sales_channel_name = products_qset.sales_channel.name
                sales_channel_id = products_qset.sales_channel_id


            pro_fields = {'id':products_qset.id,
                        'internal_reference':products_qset.internal_reference,
                        'image_path': image_path,
                        'name':product_template.name,
                        'can_be_sold':product_template.can_be_sold,
                        'can_be_purchased':product_template.can_be_purchased,
                        'can_be_expended':product_template.can_be_expended,
                        'event_subscription':product_template.event_subscription,
                        'product_type':product_template.product_type,
                        'product_category':product_template.product_category_id,
                        'product_category_name':category_name,
                        'uofm':product_template.uofm_id,
                        'uofm_name': uofm_name,
                        'purchase_uofm':product_template.purchase_uofm_id,
                        'purchase_uofm_name': purchase_uofm_name,
                        'tax_on_sale':product_template.tax_on_sale_id,
                        'tax_on_sale_name': tax_on_sale_name,
                        'wholesale_tax':product_template.wholesale_tax_id,
                        'wholesale_name': wholesale_name,
                        'description':product_template.description,
                        'notes':product_template.notes,
                        'vendors_notes':product_template.vendors_notes,
                        'sale_price':product_template.sale_price,
                        'salesperson':products_qset.sales_person_id,
                        'cost':cost,
                        'weight':product_template.weight,
                        'volume':product_template.volume,
                        'sales_person_id': sales_person_id,
                        'sales_person_name': sales_person_name,
                        'sales_channel_name': sales_channel_name,
                        'sales_channel_id': sales_channel_id,
                        }


            return pro_fields

    except Product.DoesNotExist:
        return None


# product edit page 
@login_required(login_url="/login/")
def editProduct(request, edit_id):
    return render(request, 'web/app.html')


def editdata(request, uuid):
    company_id = request.user.profile.company_id
    reponse_data = {'success':False, 'currency':get_currency_name(company_id),'total_engage_cost':'' }
    try:
        res = Product.objects.get(uuid=uuid, company_id=company_id)
        if res:
            edit_id = res.id
            if getProductFields(edit_id) is not None:
                reponse_data['product'] = getProductFields(edit_id)
                reponse_data['total_engage_cost'] = "{0:.2f}".format(get_product_total_invoice_cost(edit_id))
                reponse_data['success'] = True
            else:
                reponse_data['success'] = False
    except Product.DoesNotExist:
        pass
    return HttpResponse(json.dumps(reponse_data), content_type="application/json")

def getProductSale(id):
    products_sales_list = []
    products_sale = Sale_order_record.objects.filter(Product_id = id, status='Quotation')
    for products_sales in products_sale:
        Sale_order_record_id = products_sales.id
        Sale_order_record_order_id = products_sales.order_id
        product_sal = Sale_order.objects.filter(id = Sale_order_record_order_id, status='sale')
        for product_sa in product_sal:
            products_sales_list.append({'sales_id':product_sa.id})
    return products_sales_list



@csrf_exempt
def upload_img(request):
    user_company_id = request.user.profile.company_id
    return_status = {'success': False, 'url': '', 'width':'', 'height':'' }
    if request.method == 'POST':
        file_path = 'media/files/' + str(user_company_id) + '/product_img'
        f = request.FILES['image']
        file_return  = upload_file(file_path, f)
        return_status['width'] = file_return['width']
        return_status['height'] = file_return['height']
        return_status['success'] = file_return['success']
        return_status['url'] =file_return['url']
    return HttpResponse(json.dumps(return_status), content_type="application/json")

# start: taxes add edit get  all functionality

def getTaxes(company_id):
    tax_list = []
    utils = Utils()

    tax_objs = Product_taxes.objects.filter(company=company_id)

    for tax in tax_objs:
        tax_list.append({'id': tax.id,
                         'name': tax.name,
                         'value': utils.round_value(tax.value)
                         })
    return tax_list

def saveTaxes(request):
    company_id = request.user.profile.company_id
    user_obj   = request.user
    user_id    = user_obj.id
    response = {'success': False, 'message': '', 'result': []}

    json_data = json.loads(request.POST['post_data'])

    if 'tax_id' in json_data and int(json_data['tax_id'])!=0:
        taxes_obj = Product_taxes.objects.get(pk=int(json_data['tax_id']))
    else:
        taxes_obj = Product_taxes()

    if 'tax_name' in json_data and json_data['tax_name'] != '':
        taxes_obj.name = json_data['tax_name']

        if 'tax_value' in json_data and json_data['tax_value']!='' and float(json_data['tax_value']) > 0:
            taxes_obj.value = json_data['tax_value']
        else:
            taxes_obj.value = 0

        if 'tax_type' in json_data and json_data['tax_type']!='':
            taxes_obj.computation = json_data['tax_type'].title()
        else:
            taxes_obj.computation = 'Percentage'      

        if 'tax_scope' in json_data and json_data['tax_scope']!='':
            taxes_obj.scope = json_data['tax_scope']
        else:
            taxes_obj.scope = 'sale'

        taxes_obj.create_by = user_obj
        taxes_obj.company_id   = company_id
        taxes_obj.user_id   = user_id

        taxes_obj.save()

        if taxes_obj.id > 0:
            response['result'] = {'tax_id': taxes_obj.id, 'tax_name': taxes_obj.name,
                                  'tax_value': taxes_obj.value, 'tax_type': taxes_obj.computation,
                                  'tax_scope': taxes_obj.scope
                                  }
            response['success'] = True

    return HttpResponse(json.dumps(response), content_type="application/json")


def getTaxesById(request, tax_id):
    data = {}
    utils = Utils()
    data['success'] = False
    try:
        pro_tax = Product_taxes.objects.get(pk=tax_id)
        
        data['name']        = pro_tax.name
        data['value']       = utils.round_value(pro_tax.value)
        data['computation'] = pro_tax.computation
        data['scope']       = pro_tax.scope

        data['success'] = True

    except Product_taxes.DoesNotExist:
        pro_tax = None

    return HttpResponse(json.dumps(data), content_type="application/json")


def deleteProducts(request):
    data = {}
    data['success'] = False

    pro_ids = json.loads(request.POST['data'])

    if len(pro_ids)>0:
        for i in pro_ids:
            try:
                pro_obj = Product.objects.get(pk=int(i))
                if pro_obj.product_tmpl is not None:
                    Product_template.objects.get(pk = pro_obj.product_tmpl_id).delete()
            except pro_obj.DoesNotExist:
                pass
        
        data['success'] = True

    return HttpResponse(json.dumps(data), content_type="application/json")

def productexport(request):

    export_status = {'success':False}
    id_list  = json.loads(request.POST['ids'])
    list_dic =[]
    data        =[]
    if len(id_list)>0:
        for i in id_list:
            quot_obj = Product.objects.filter(pk=int(i))
            for o in quot_obj:
                try:
                    product_tmpl = Product_template.objects.get(pk=o.product_tmpl_id)
                except Product_template.DoesNotExist:
                    product_tmpl = None

                if product_tmpl is not None:
                    product_type = product_tmpl.product_type
                    sale_price   = product_tmpl.sale_price

                    if product_tmpl.id is not None:
                        try:
                            cost_obj  = Product_cost_history.objects.filter(product = product_tmpl.id).last()
                            if cost_obj is not None and cost_obj !='':
                                if cost_obj.cost is not None and cost_obj.cost !='':
                                    product_cost = cost_obj.cost
                                else:
                                    product_cost  = ''
                            else:
                                product_cost  = ''
                                
                        except Product_cost_history.DoesNotExist:
                                product_cost  = ''  
                        

                    if product_tmpl.product_category is not None:
                        try:
                            pro_category = Product_category.objects.filter(pk=product_tmpl.product_category_id)
                            for pro_categ in pro_category:
                                if pro_categ is not None and pro_categ !='':
                                    product_category = getProParentCate(pro_categ)
                                else:
                                    product_category = ''    
                        except Product_category.DoesNotExist:
                            pro_category = ''
                    else :
                         product_category = '' 


                if o.template_name is not None and o.template_name !='':
                    
                    template_name = o.template_name
                else:
                    template_name = '-'              

                if o.internal_reference is not None and o.internal_reference !='':
                    
                    internal_reference = o.internal_reference
                else:
                    internal_reference ='-'              

                if sale_price is not None and sale_price !='':
                    
                    sale_price = str(sale_price)
                else:
                    sale_price = ''
                
                if product_type is not None and product_type !='':
                    product_type = product_type
                else:
                    product_type = ''

                list_dic.append({
                        'Internal Reference'  :internal_reference,
                        'Name'    :template_name, 
                        'Sale Price' :sale_price,        
                        'Cost':product_cost,
                        'Internal Category':product_category,
                        'Product Type':product_type,
                    })

    if list_dic:
        to_csv = list_dic
        keys1 = to_csv[0].keys()
        keys = (['Internal Reference','Name','Sale Price','Cost', 'Internal Category','Product Type'])
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

            
def imports(request):
    if len(request.FILES) != 0:
        contact_list ={'success':False,'file':''}
        file_path = 'media/user_csv/'+str(request.user.id)
        user_company_id = request.user.profile.company_id
        fields = []
        product_fileds = Product._meta.get_fields()
        for field in product_fileds:
            fields_dic = {'name':field.name}
            fields.append(fields_dic)
    
        contact_list['fields'] = [{'name': 'Product name'}, {'name': 'Can be Sold'},{'name': 'Can be Purchased'},{'name': 'Can be Expensed'}, {'name': 'Event Subscription'},{'name': 'Product Type'},{'name': 'Internal Reference'},{'name': 'Product Category'}, {'name': 'Sale Price'},{'name': 'Unit of Measure'},{'name': 'Description'},{'name': 'Cost'}, {'name': 'Tax on Sale'},{'name': 'Volume'},{'name': 'Weight'}, {'name': 'Sales Person'},{'name': 'Sales Team'},{'name': 'Internal Note'},{'name': 'Internal Note for Vendor'}, {'name': 'image'}]
        # contact_list['fields'] = fields
        if request.method == 'POST' and request.FILES['ufile']:
            if request.FILES['ufile'].name.split('.')[-1] == "csv":
                myfile = request.FILES['ufile']
                fs = FileSystemStorage(location='media/user_csv/'+str(request.user.id))
                filename = fs.save(myfile.name, myfile)
                uploaded_file_url = settings.BASE_DIR + '/' + file_path + '/' + filename
                file_rows =[]
                temp_list_one =[]
                temp_list_two = []
                temp_list_three = []
                temp_list_four = []
                temp_list_five = []
                header_list =[]

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
                                        if line_number ==1:
                                            temp_list_one.append(row[i])
                                        if line_number ==2:
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
                                file_rows.append(str(temp_list_one[i])+"\n"+str(temp_list_two[i])+"\n"+str(temp_list_three[i])+"\n"+str(temp_list_four[i])+"\n"+str(temp_list_five[i]))

                            contact_list['csv_cols'] = file_rows
                            contact_list['header'] = header_list
                            contact_list['success'] = True
                            contact_list['msg'] = 'processing'
                        except csv.Error as e:
                            sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
                except IOError as e:
                    print("I/O error({0}): {1}".format(e.errno, e.strerror))
            else:
                contact_list = {'success': False, 'file': '', 'msg':'You did not selected csv file.'}
    else:
        contact_list = {'success': False, 'file': '', 'msg':'You did not selected any file.'}
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def import_mapping(request):
    contact_list = {'success': False, 'file': ''}
    user_id = request.user.id
    company_id   = request.user.profile.company_id
    user_obj     = request.user
    utils = Utils()
    if request.method == "POST" and request.is_ajax():
        if 'file_name' in request.POST:
            file_name = request.POST['file_name']
            fields = json.loads(request.POST['fields'])
            if fields.count('0') == len(fields):
                contact_list = {'success': False, 'file': '', 'msg':'You did not selected any fields.'}
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
                            format_and_save_product(company_id, user_obj,file_rows)
                        contact_list['csv_cols'] = file_rows
                        contact_list['success'] = True
                        contact_list['msg'] = 'Import is running, whenever, you can use the system'
                        os.remove(uploaded_file_url)
                    except csv.Error as e:
                        sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
            except IOError as e:
                print("I/O error({0}): {1}".format(e.errno, e.strerror))
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def format_and_save_product(company_id, user_obj,list_data):

    contact_data_list =[]
    utils = Utils()
    for i, d in enumerate(list_data):

        fields_list = []
        contact_data = {'fields': []}
        fields_list.append(d)

        contact_data['fields'] = fields_list
        contact_data_list.append(contact_data)
        save_in_db(company_id, user_obj,contact_data)
    return True

def save_in_db(company_id, user_obj,contact_data):

    company_id             = company_id
    user_obj               = user_obj
    user_id                = user_obj.id

    fields_data            = {}
    fields_data['success'] = False
    fields = contact_data['fields']
 
    product_tmpl_obj = Product_template();


    for fields_data in fields:

        if 'Product name' in fields_data and  fields_data['Product name']!='':

            product_tmpl_obj.name = fields_data['Product name']

            if 'Can be Sold' in fields_data and fields_data['Can be Sold']=='1':
                product_tmpl_obj.can_be_sold = True

            if 'Can be Purchased' in fields_data and fields_data['Can be Purchased']=='1':
                product_tmpl_obj.can_be_purchased = True

            if 'Can be Expensed' in fields_data and fields_data['Can be Expensed']=='1':
                product_tmpl_obj.can_be_expended = True

            if 'subcription_ok' in fields_data and fields_data['subcription_ok']=='1':
                product_tmpl_obj.event_subscription = True

            if 'Product Type' in fields_data and fields_data['Product Type'] is not None and fields_data['Product Type'] in ['consumable', 'service', 'stockable']:
                product_tmpl_obj.product_type = fields_data['Product Type']

            if 'Product Category' in fields_data and fields_data['Product Category']!='':

                try:
                    contactpt= Product_category.objects.get(name=fields_data['Product Category'])
                    product_tmpl_obj.product_category_id = contactpt.id
                except:
                    contactp = Product_category()
                    contactp.name = fields_data['Product Category']
                    contactp.user_id = user_id
                    contactp.save()

                    product_tmpl_obj.product_category_id = contactp.id


            if 'Sale Price' in fields_data and fields_data['Sale Price']!='' and fields_data['Sale Price'] != '-':
                product_tmpl_obj.sale_price = fields_data['Sale Price']

            if 'unit_of_measure' in fields_data and fields_data['unit_of_measure']!='':
                product_tmpl_obj.uofm_id = fields_data['unit_of_measure']

            if 'purchase_unit_of_measure' in fields_data and fields_data['purchase_unit_of_measure']!='':
                product_tmpl_obj.purchase_uofm_id = fields_data['purchase_unit_of_measure']

            if 'discription' in fields_data and fields_data['discription']!='':
                product_tmpl_obj.description = fields_data['discription']

            if 'tax_on_sale' in fields_data and fields_data['tax_on_sale']!='' and fields_data['tax_on_sale'] != '-':
                product_tmpl_obj.tax_on_sale_id = int(fields_data['tax_on_sale'])

            if 'wholesale_tax' in fields_data and fields_data['wholesale_tax']!='' and fields_data['wholesale_tax'] != '-':
                product_tmpl_obj.wholesale_tax_id = int(fields_data['wholesale_tax'])

            if 'volume' in  fields_data and fields_data['volume']!='':
                product_tmpl_obj.volume = fields_data['volume']
            
            if 'weight' in  fields_data and fields_data['weight']!='':
                product_tmpl_obj.weight = fields_data['weight']

            if 'product_notes' in fields_data and fields_data['product_notes']!='':
                product_tmpl_obj.notes = fields_data['product_notes']

            if 'sales-person'  in fields_data and fields_data['sales-person']!='' and fields_data['sales-person'] != '-':
                
                product_tmpl_obj.sales_person = int(fields_data['sales-person'])

            else:

                product_tmpl_obj.sales_person  = user_id


            if 'sales_team'  in fields_data and fields_data['sales_team']!='':
                product_tmpl_obj.salesteam_id  = fields_data['sales_team']

            if 'desc-vendors' in fields_data and fields_data['desc-vendors']!='':
                product_tmpl_obj.vendors_notes = fields_data['desc-vendors']

            product_tmpl_obj.create_by_user = user_obj
            product_tmpl_obj.company  = company_id

            product_tmpl_obj.save()

            if product_tmpl_obj.id>0:
                product_obj = Product();

                product_obj.product_tmpl   = product_tmpl_obj
                product_obj.template_name  = fields_data['Product name']
                product_obj.create_by_user = user_obj
                product_obj.company        = company_id

                if 'sales-person'  in fields_data and fields_data['sales-person']!="" and fields_data['sales-person'] is not None :
                    product_obj.sales_person  =  int(fields_data['sales-person'])
                else:
                    product_obj.sales_person = user_id


                if 'sales_team'  in fields_data and fields_data['sales_team']!=""  and fields_data['sales_team'] is not None:
                    product_obj.salesteam_id  = fields_data['sales_team_id']
                else:
                    product_obj.salesteam_id  = ''

                if 'volume' in  fields_data and fields_data['volume']!='':
                    product_obj.volume = fields_data['volume']
            
                if 'weight' in  fields_data and fields_data['weight']!='':
                    product_obj.weight = fields_data['weight']

                if 'Internal Reference' in  fields_data and fields_data['Internal Reference']!='':
                    product_obj.internal_reference = fields_data['Internal Reference']

                if 'img_url' in  fields_data and fields_data['img_url']!='':
                    product_obj.image_path = fields_data['img_url']
                product_obj.save()
                if product_obj.id > 0:
                    cost_obj = Product_cost_history()
                    cost_obj.product = product_tmpl_obj
                    if 'Cost' in  fields_data and fields_data['Cost']!='':
                        cost_obj.cost = fields_data['Cost']

                    cost_obj.company =  company_id  
                    cost_obj.save()

                if product_obj.id > 0:
                    fields_data['id'] = product_obj.id
                    fields_data['name'] = product_obj.template_name
                    fields_data['success'] = True

        else:
            fields_data['success'] = False
    return fields_data


def add_default_product_tax(request):
    user_obj = request.user
    company_id = request.user.profile.company_id
    if user_obj and company_id:
        tmpl_obj = Product_taxes()
        tmpl_obj.name = '20 % Taxes'
        tmpl_obj.value = 20
        tmpl_obj.computation = 'Percentage'
        tmpl_obj.scope = 'sale'
        tmpl_obj.company_id = company_id
        tmpl_obj.user = user_obj
        tmpl_obj.create_by = user_obj
        tmpl_obj.is_default = True
        tmpl_obj.save()
        return tmpl_obj
    else:
        return False

@login_required(login_url="/login/")
def get_product(request):
    return_status = {'success': False, 'result': []}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        products = Product.objects.filter(company_id=company_id)
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            products = products.filter(template_name__icontains=keyword)
        if len(products) > 0:
            products = products.order_by('-id')[:10]
            return_status['success'] = True
            for product in products:
                temp_dic = {'id': product.id, 'uuid':str(product.uuid), 'name':product.template_name}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')

@login_required(login_url="/login/")
def get_product_unit(request):
    return_status = {'success': False, 'result': []}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        products = Product_unit_of_measure.objects.filter(company_id=company_id)
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            products = products.filter(name__icontains=keyword)
        if len(products) > 0:
            products = products.order_by('-id')[:10]
            return_status['success'] = True
            for product in products:
                temp_dic = {'id': product.id,  'name':product.name}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@login_required(login_url="/login/")
def get_tax(request):
    return_status = {'success': False, 'result': []}
    utils = Utils()
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        products = Product_taxes.objects.filter(company_id=company_id)
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            products = products.filter(name__icontains=keyword)
        if len(products) > 0:
            products = products.order_by('-id')[:10]
            return_status['success'] = True
            for product in products:
                temp_dic = {'id': product.id, 'uuid':str(product.uuid), 'name':product.name,
                            'computation':product.computation, 'value':utils.round_value(product.value)}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@login_required(login_url="/login/")
def get_unit_category(request):
    return_status = {'success': False, 'result': []}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        uom_category = Product_uom_category.objects.filter(company_id=company_id)
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            uom_category = uom_category.filter(name__icontains=keyword)
        if len(uom_category) > 0:
            uom_category = uom_category.order_by('-id')[:10]
            return_status['success'] = True
            for category in uom_category:
                temp_dic = {'id': category.id,  'name':category.name}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@login_required(login_url="/login/")
def get_product_category(request):
    return_status = {'success': False, 'result': []}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        product_category = Product_category.objects.filter(company=company_id)
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            product_category = product_category.filter(name__icontains=keyword)
        if len(product_category) > 0:
            product_category = product_category.order_by('-id')[:10]
            return_status['success'] = True
            for category in product_category:
                name = category.name
                if category.parent is not None:
                    name = str(category.parent.name) + ' / ' + str(category.name)
                temp_dic = {'id': category.id,  'name':name}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@login_required(login_url="/login/")
def get_sales_person(request):
    return_status = {'success': False, 'result': []}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        users = Profile.objects.select_related('user','company').filter(company_id=company_id, user__is_active=True).order_by('user__id')
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            users = users.filter(user__first_name__icontains=keyword)
        if len(users) > 0:
            users = users.order_by('-id')[:10]
            return_status['success'] = True
            for profile in users:
                name = profile.user.first_name
                temp_dic = {'id': profile.id,  'name':name}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')