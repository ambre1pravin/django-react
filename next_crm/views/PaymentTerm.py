from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.db.models import Q
import json
from next_crm.models import Term, Quotation_template, Quotation_template_record, Delivery_method, Payment_term


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
def save_payment_term(request):
    print(request.user.company)
    company_id = request.user.profile.company_id

    user_obj = request.user
    user_id = user_obj.id
    fields_data = {}
    fields_data['success'] = False
    # hiddenid=[]

    json_data = json.loads(request.POST['fields'])
    if json_data['payment_term_id'] != '' and json_data['payment_term_id'] > 0:

        tmpl_obj = Payment_term.objects.get(pk=int(json_data['payment_term_id']))
        tmpl_obj.name = json_data['name']
        tmpl_obj.notes = json_data['notes']
        tmpl_obj.save()
        if len(json_data['payment_items']) > 0:
            for i, item in enumerate(json_data['payment_items']):
                item_id = str(item['id'])
                if item_id.find("item_") == -1:
                    try:
                        payment_term = Term.objects.get(pk=int(item_id), payment_term=tmpl_obj)
                        payment_term.order = i
                        payment_term.save()
                    except Term.DoesNotExist:
                        print('Deleted from trash', item_id)
                else:
                    term = Term()
                    term.order = i
                    term.due_type = item['due_type']
                    term.value = item['value']
                    term.days = item['days']
                    term.number_days = item['number_days']
                    term.company = request.user.company
                    term.create_by_user = user_obj
                    term.update_by_user = user_obj
                    term.payment_term = tmpl_obj
                    term.save()
            fields_data['name'] = tmpl_obj.name
            fields_data['id'] = tmpl_obj.id
            fields_data['success'] = True
    else:
        if 'name' in json_data and json_data['name'] != '':
            print("test", len(json_data['payment_items']), type(json_data['payment_items']))
            if len(json_data['payment_items']) > 0:
                payment_term = Payment_term()
                payment_term.name = json_data['name']
                payment_term.notes = json_data['notes']
                payment_term.company = request.user.company
                payment_term.create_by_user = user_obj
                payment_term.update_by_user = user_obj
                payment_term.save()
                if payment_term:
                    for i, item in enumerate(json_data['payment_items']):
                        term = Term()
                        term.order = i
                        term.due_type = item['due_type']
                        term.value = item['value']
                        term.days = item['days']
                        term.number_days = item['number_days']
                        term.company = request.user.company
                        term.create_by_user = user_obj
                        term.update_by_user = user_obj
                        term.payment_term = payment_term
                        term.save()
                    fields_data['name'] = payment_term.name
                    fields_data['id'] = payment_term.id
                    fields_data['success'] = True

    return HttpResponse(json.dumps(fields_data), content_type="application/json")


@login_required(login_url="/login/")
def saveTerm(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    fields_data = {}

    fields_data['success'] = False

    json_data = json.loads(request.POST['fields'])

    fields_data = formatFields(json_data)

    if 'due_type' in fields_data and fields_data['due_type'] != '':
        tmpl_obj = Term()
        tmpl_obj.due_type = fields_data['due_type']
        tmpl_obj.value = fields_data['value']
        tmpl_obj.days = fields_data['days']
        tmpl_obj.number_days = fields_data['number_days']
        tmpl_obj.company = company_id
        tmpl_obj.create_by_user = user_obj

        if 'hiddenid' in fields_data and fields_data['hiddenid'] != '':
            tmpl_obj.payment_term = fields_data['hiddenid']
        else:
            tmpl_obj.payment_term = None

        tmpl_obj.save()
        so_id = tmpl_obj.id

        fields_data['success'] = True
        fields_data['id'] = so_id
        fields_data['due_type'] = fields_data['due_type']

    return HttpResponse(json.dumps(fields_data), content_type="application/json")


@login_required(login_url="/login/")
def listdata(request):
    data = {}
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    payment_list = []
    can_remove = True

    limit = settings.PAGGING_LIMIT
    offset = ""

    if request.method == "POST":
        json_data = json.loads(request.POST['fields'])
        parameter = formatFields(json_data)

        names = json.loads(request.POST['names'])

        offset = int(parameter['offset'])
        limit = offset + int(limit)

        orderby = '-id'

        payment = Payment_term.objects.filter(company=company_id)
        like_cond = Q()
        if len(names) > 0:
            orderby = 'name'
            for name in names:
                like_cond = like_cond | Q(name__icontains=name)
            payment = payment.filter(like_cond)
        total_payment = len(payment)
        payment = payment.order_by(orderby)
        payment = payment[offset:limit]

        data['total_count'] = total_payment

        for o in payment:
            payment_list.append({
                'id': o.id,
                'uuid': str(o.uuid),
                'name': o.name,
                'can_remove': can_remove
            })
    data['payment'] = payment_list
    return HttpResponse(json.dumps(data), content_type="application/json")


@login_required(login_url="/login/")
def viewdata(request, view_id):
    data = {}
    company_id = request.user.profile.company_id
    data['success'] = False
    op_id_list = getOpIdList(request, company_id)
    if len(op_id_list) > 0:
        data['op_id_list'] = op_id_list
    try:
        qt = Payment_term.objects.get(uuid=view_id, company_id=company_id)
        payment = {'id': qt.id, 'name': qt.name, 'notes': qt.notes, }
        data['payment'] = payment
        data['success'] = True
    except Payment_term.DoesNotExist:
        data['success'] = False

    return HttpResponse(json.dumps(data), content_type="application/json")


def getOpIdList(request, company_id):
    op_id_list = []
    op_objs = Payment_term.objects.filter(company=company_id).order_by('id')

    for op in op_objs:
        op_id_list.append({'id': op.id})

    return op_id_list


@login_required(login_url="/login/")
def editdata(request, edit_id):
    data = {}
    data['success'] = False
    company_id = request.user.profile.company_id
    try:
        qt = Payment_term.objects.get(uuid=edit_id, company_id=company_id)
        payment = {'id': qt.id, 'name': qt.name, 'notes': qt.notes, }
        data['payment'] = payment
        data['success'] = True
    except Payment_term.DoesNotExist:
        data['success'] = False
    return HttpResponse(json.dumps(data), content_type="application/json")


def get_terms_by_payment_term_id(payment_term_id):
    terms_list = []
    try:
        terms = Term.objects.filter(payment_term_id=payment_term_id).order_by('order')
        if len(terms) > 0:
            for o in terms:
                terms_list.append({'id': o.id, 'due_type': o.due_type, 'value': o.value, 'number_days': o.number_days,
                                   'days': o.days})
        return terms_list
    except Term.DoesNotExist:
        return terms_list


def getTermData(request, uuid):
    company_id = request.user.profile.company_id
    data = {'success': False}
    try:
        payment_term = Payment_term.objects.get(uuid=uuid, company=company_id)
        if payment_term:
            term_id = payment_term.id
            data['term'] = get_terms_by_payment_term_id(term_id)
            data['success'] = True
    except Payment_term.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type="application/json")


def OrderUpdate(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    fields_data = {}
    fields_data['success'] = False
    thumbnail_list = []
    json_data = json.loads(request.POST['fields'])
    for sid in json_data:
        op_in_order = (sid['id'])
        thumbnail_list.append(op_in_order)

        if thumbnail_list:
            for index, items in enumerate(thumbnail_list):
                opp_entity = Term.objects.get(pk=items)
                opp_entity.order = index
                opp_entity.save()

    fields_data['success'] = True
    return HttpResponse(json.dumps(fields_data), content_type="application/json")


@login_required(login_url="/login/")
def update(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    fields_data = {}
    fields_data['success'] = False

    json_data = json.loads(request.POST['fields'])

    if 'payment_term_id' in json_data and json_data['payment_term_id'] and 'name' in json_data and json_data[
        'name'] != '':
        try:
            tmpl_obj = Payment_term.objects.get(uuid=json_data['payment_term_id'], company_id=company_id)
            tmpl_obj.name = json_data['name']
            tmpl_obj.notes = json_data['notes']
            tmpl_obj.company = request.user.company
            tmpl_obj.update_by_user = user_obj
            tmpl_obj.save()
            if len(json_data['payment_items']) > 0:
                for i, item in enumerate(json_data['payment_items']):
                    item_id = str(item['id'])
                    if item_id.find("item_") == -1:
                        try:
                            payment_term = Term.objects.get(pk=int(item_id), payment_term=tmpl_obj)
                            payment_term.order = i
                            payment_term.save()
                        except Term.DoesNotExist:
                            print('Deleted from trash', item_id)
                    else:
                        term = Term()
                        term.order = i
                        term.due_type = item['due_type']
                        term.value = item['value']
                        term.days = item['days']
                        term.number_days = item['number_days']
                        term.company = request.user.company
                        term.create_by_user = user_obj
                        term.update_by_user = user_obj
                        term.payment_term = tmpl_obj
                        term.save()
                    fields_data['success'] = True
        except Payment_term.DoesNotExist:
            fields_data['success'] = False

    return HttpResponse(json.dumps(fields_data), content_type="application/json")


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields


def deletepayment(request):
    data = {'success': False}
    id_list = json.loads(request.POST['ids'])
    if len(id_list) > 0:
        for i in id_list:

            try:
                quot_obj = Payment_term.objects.get(pk=int(i)).delete()
            except quot_obj.DoesNotExist:
                pass

        data['success'] = True

    return HttpResponse(json.dumps(data), content_type='application/json')


def deleteterm(request):
    data = {'success': False, }
    company_id = request.user.profile.company_id
    post_data = json.loads(request.POST['post_data'])
    term_id = post_data['term_id']
    try:
        payment_term = Payment_term.objects.get(uuid=post_data['payment_term_id'], company_id=company_id)
        if payment_term and term_id:
            try:
                term = Term.objects.get(pk=int(term_id), payment_term_id=payment_term.id)
                if term:
                    term.delete()
                    data['term'] = get_terms_by_payment_term_id(payment_term.id)
                    data['success'] = True
            except Term.DoesNotExist:
                data['success'] = False
    except Payment_term.DoesNotExist:
        data['success'] = False
    return HttpResponse(json.dumps(data), content_type='application/json')


def getPaymentTermById(request, payment_term_id):
    data = {}
    data['success'] = False
    try:
        payment_term = Payment_term.objects.get(pk=payment_term_id)
        data['id'] = payment_term.id
        data['name'] = payment_term.name
        data['notes'] = payment_term.notes
        data['success'] = True

    except Payment_term.DoesNotExist:
        payment_term = None

    return HttpResponse(json.dumps(data), content_type="application/json")

@login_required(login_url="/login/")
def get_payment_term(request):
    return_status = {'success': False, 'result': []}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        payment_term = Payment_term.objects.filter(company=company_id)
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            payment_term = payment_term.filter(name__icontains=keyword)
        if len(payment_term) > 0:
            payment_term = payment_term.order_by('-id')[:10]
            return_status['success'] = True
            for category in payment_term:
                name = category.name
                temp_dic = {'id': category.id,  'name':name}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')
