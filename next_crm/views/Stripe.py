from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import stripe
import json, os,  re
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import time
from datetime import datetime, date, timedelta
from next_crm.models import Stripe, StripeInvoice


def price_list(request):
    return render(request, 'web/app.html')
def update_subscription(subscription_id, plan_id, quantity):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    subscription = stripe.Subscription.retrieve(subscription_id)
    subscription['items']['data']
    if subscription['items']['data']:
        for item in subscription['items']['data']:
            if item['plan']['id'] == plan_id:
                sub =stripe.Subscription.modify(subscription_id, items=[{"id": item.id, "quantity": quantity,}])
                print("my update",sub)

def stripe_invoices(request):
    return_response = {'success': False}
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    stripe_primary = Stripe.objects.all()
    if stripe_primary:
        for primary_data in stripe_primary:
            last_stripe_invoice = StripeInvoice.objects.filter(company_id=primary_data.company_id).order_by("-id")
            if last_stripe_invoice:
                invoice_list = stripe.Invoice.list(customer=primary_data.customer_id,starting_after=last_stripe_invoice[0].invoice_id)
            else:
                invoice_list = stripe.Invoice.list(customer=primary_data.customer_id)

            if len(invoice_list['data']) > 0:
                for data in invoice_list['data']:
                    stripe_inv_obj = StripeInvoice()
                    stripe_inv_obj.stripe_id = primary_data.id
                    stripe_inv_obj.invoice_id = data['id']
                    stripe_inv_obj.customer_id = data['customer']
                    stripe_inv_obj.amount_paid = data['amount_paid']/100
                    stripe_inv_obj.tax = data['tax']
                    stripe_inv_obj.tax_percent = data['tax_percent']
                    stripe_inv_obj.charge_id = data['charge']
                    stripe_inv_obj.currency = data['currency']
                    stripe_inv_obj.description = data['description']
                    stripe_inv_obj.items = data['lines']
                    stripe_inv_obj.company_id = primary_data.company_id
                    stripe_inv_obj.user_id = primary_data.user_id
                    if data['discount']:
                        stripe_inv_obj.discount = data['discount']/100
                    else:
                        stripe_inv_obj.discount = 0.00
                    stripe_inv_obj.invoice_pdf = data['invoice_pdf']
                    stripe_inv_obj.date = datetime.fromtimestamp(data['date']).isoformat()
                    stripe_inv_obj.date_time = data['date']
                    stripe_inv_obj.invoice_number = data['number']
                    stripe_inv_obj.save()

        return_response['success'] =True
        #print('Anil->',primary_data.customer_id)
    return HttpResponse(json.dumps(return_response), content_type="application/json")

@login_required(login_url="/login/")
def price_list_ajax(request):
   return_status = {'success': False, 'result': [], 'msg': ''}
   #customer_id = 'cus_C6ZjtX1gFBvZmY'
   #subscription = get_all_invoice(customer_id)
   subscription = StripeInvoice.objects.filter(company=request.user.profile.company)
   if subscription:
       return_status['success'] = True
       for item in subscription:
           paid = 'Paid'
           created_at = time.strftime("%d/%m/%Y %H:%M", time.localtime(int(item.date_time)))
           return_status['result'].append({'date':created_at,'order_number':item.invoice_number,'status':paid,'amount':float(item.amount_paid),'invoice_pdf':item.invoice_pdf})
   return HttpResponse(json.dumps(return_status), content_type="application/json")
