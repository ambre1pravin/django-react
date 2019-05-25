from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from next_crm.models.sales_order.sale_order import Sale_order
from next_crm.models.opportunity.opportunity import Opportunity
from next_crm.models.sales_order.customer_invoice import Customer_invoice
from next_crm.forms.opportunity.opportunity_form import OpportunityForm
from django.db.models import Sum
import json



#from next_crm.models import Contacts,Company,ContactFieldsValue,ContactFields,DefaultDataFields,ContactTab


@login_required(login_url="/login/")
def sales(request):    	
    return render(request, 'web/app.html')

def getOpportunity(user_id):
    opportunity = Opportunity.objects.filter(user_id=user_id)
    opportunity_data = [{'id':i.id, 'month' : (i.created_at).strftime('%B'),
            'estimated_revenue':int(i.estimated_revenue),
            'created_at':(i.created_at).strftime("%Y-%m-%d %H:%M:%S")}
            for i in opportunity
        ]
    is_won = opportunity.filter(is_won=True).aggregate(Sum('estimated_revenue'))
    is_open = opportunity.filter(is_open=True).aggregate(Sum('estimated_revenue'))
    context = opportunity.aggregate(Sum('estimated_revenue'))
    return {
                "opportunity_sum":int(context['estimated_revenue__sum']),
                'opportunity':opportunity_data,
                'is_won':int(is_won['estimated_revenue__sum'] if is_won['estimated_revenue__sum'] else 0),
                'is_open':int(is_open['estimated_revenue__sum'] if is_open['estimated_revenue__sum'] else 0)
    }

def getQuatations(user_id):
    quatations = Sale_order.objects.filter(create_by_user=user_id, module_type='QUOTATION')
    confirmed_quat = 0
    open_quat = 0
    quatations_list = []

    for i in quatations:
        if i.status == 'done':
            confirmed_quat += i.total_amount
        else:
            open_quat += i.total_amount
        
        quatations_list.append({
            'month':i.created_at.strftime('%B'),
            'total_amount': int(i.total_amount),
            'created_at': str(i.created_at),
            'status':i.status
        })
    return {'quatations':quatations_list,'open':int(open_quat),'confirm':int(confirmed_quat)}

def getInvoice(user_id):
    invoice = Customer_invoice.objects.filter(create_by_user=user_id)

    invoice_list =  [{
                        'month':i.created_at.strftime('%B'),
                        'created_at': str(i.created_at),
                        'total_amount': int(i.total_amount)} 
                        for i in invoice
                    ]

    invoice_sum = invoice.aggregate(Sum('total_amount'))
    invoice_average = int(invoice_sum['total_amount__sum'])/len(invoice_list)
    
    return {'invoice':invoice_list,'invoice_average':invoice_average,'invoice_sum':int(invoice_sum['total_amount__sum'])}


@login_required(login_url="/login/")
def getChartsData(request):
    opportunity = getOpportunity(request.user.id)
    quatations = getQuatations(request.user.id)
    invoice = getInvoice(request.user.id)

    return HttpResponse(json.dumps({ 
                                    'opportunity':opportunity,
                                    'quatations':quatations,
                                    'invoice':invoice
                            }), 
                            content_type="application/json"
                        )
