from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from next_crm.models.sales_order.sale_order import Sale_order
from next_crm.models.opportunity.opportunity import Opportunity
from next_crm.models.sales_order.customer_invoice import Customer_invoice
from next_crm.forms.opportunity.opportunity_form import OpportunityForm
from django.db.models import Sum
import json
from django.core import serializers



#from next_crm.models import Contacts,Company,ContactFieldsValue,ContactFields,DefaultDataFields,ContactTab


@login_required(login_url="/login/")
def sales(request):    	
    return render(request, 'web/app.html')

def getOpportunity(user_id):
    opportunity = Opportunity.objects.filter(user_id=user_id)
    context = opportunity.aggregate(Sum('estimated_revenue'))

    opportunity_month = [i.created_at.strftime('%B') for i in opportunity]
    opportunity_amount = [int(i.estimated_revenue) for i in opportunity]

    is_won = opportunity.filter(is_won=True).aggregate(Sum('estimated_revenue'))
    is_open = opportunity.filter(is_open=True).aggregate(Sum('estimated_revenue'))

    return {
                "opportunity_sum":int(context['estimated_revenue__sum']),
                'opportunity_month':opportunity_month,
                'opportunity_amount':opportunity_amount,
                'is_won':int(is_won['estimated_revenue__sum'] if is_won['estimated_revenue__sum'] else 0),
                'is_open':int(is_open['estimated_revenue__sum'] if is_open['estimated_revenue__sum'] else 0)
    }

def getQuatations(user_id):
    quatations = Sale_order.objects.filter(create_by_user=user_id, module_type='QUOTATION')

    quatations_month = [i.created_at.strftime('%B') for i in quatations]
    quatations_amount = [int(i.total_amount) for i in quatations]

    confirmed_quat = quatations.filter(status='done').aggregate(Sum('total_amount'))
    open_quat = quatations.filter(status='done').aggregate(Sum('total_amount'))


    return {
        # 'quatations':serializers.serialize('json',  quatations.order_by('-id')),
            'open':open_quat or 0,
            'confirm': confirmed_quat or 0,
            'quatations_amount':quatations_amount,
            'quatations_month':quatations_month
        }

def getInvoice(user_id):
    invoice = Customer_invoice.objects.filter(create_by_user=user_id)
    invoice_month = [i.created_at.strftime('%B') for i in invoice]
    invoice_amount = [int(i.total_amount) for i in invoice]
    
    invoice_sum = invoice.aggregate(Sum('total_amount'))

    try:
        invoice_average = int(invoice_sum['total_amount__sum'])/len(invoice_amount)
    except Exception:
        invoice_average = 0
    
    return {'invoice_amount':invoice_amount, 'invoice_month':invoice_month,
            'invoice_average':invoice_average,
            'invoice_sum':int(invoice_sum['total_amount__sum']) if invoice_sum['total_amount__sum'] else 0,
            'last_invoice':serializers.serialize('json',  invoice.order_by('-id')[:5])
            }


@login_required(login_url="/login/")
def getChartsData(request):

    return HttpResponse(json.dumps({ 
                                    'opportunity_data': getOpportunity(request.user.id),
                                    'quatations_data':getQuatations(request.user.id),
                                    'invoice_data':getInvoice(request.user.id),
                                    'forecast':''

                            }), 
                            content_type="application/json"
                        )
