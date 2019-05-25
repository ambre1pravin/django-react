from django.http import HttpResponse
import json, os,  re
from django.contrib.auth.decorators import login_required
from next_crm.models import ContactTags
from django.db.models import Q


@login_required(login_url="/login/")
def get_tags(request):
    return_status = {'success': False, 'result': []}
    user_company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        contact_tags = ContactTags.objects.all().filter(Q(company_id=user_company_id) | Q(user_id__isnull=True))
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            contact_tags = contact_tags.filter(name__icontains=keyword)
        if len(contact_tags) > 0:
            contact_tags = contact_tags.order_by('-id')[:10]
            return_status['success'] = True
            for o in contact_tags:
                return_status['result'].append({'name': o.name, 'id': o.id, 'color': o.color})
    return HttpResponse(json.dumps(return_status), content_type="application/json")

@login_required(login_url="/login/")
def create_tag(request):
    user_id = request.user.id
    user_company_id = request.user.profile.company_id
    contact_list = {'success': False}
    if request.method == "POST" and request.is_ajax():
        post_data = json.loads(request.POST['post_data'])
        try:
            tags = ContactTags.objects.get(name=post_data['name'], company_id=user_company_id,)
        except ContactTags.DoesNotExist:
            tags = ContactTags(name=post_data['name'], company_id=user_company_id, user_id=user_id)
            tags.save()
        tag = {'id':tags.id,'color':tags.color,'name':tags.name,'class':'show', 'new_tag':True}
        contact_list = {'success': True,'tag':tag}

    return HttpResponse(json.dumps(contact_list), content_type="application/json")

@login_required(login_url="/login/")
def update_tag(request):
    return_status = {'success': False, 'msg':''}
    if request.method == "POST" and request.is_ajax():
        post_data = json.loads(request.POST['post_data'])
        try:
            contact_tag = ContactTags.objects.get(pk = int(post_data['tag_id']))
            contact_tag.color = post_data['color']
            contact_tag.save()
            return_status['success'] = True
        except ContactTags.DoesNotExist:
            return_status['msg'] = 'Tag does not exits'
    return HttpResponse(json.dumps(return_status), content_type='application/json')