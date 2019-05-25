import stripe
import requests, json,ast
from django.conf import settings


def create_customer(email, token=None):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    if token:
        customer = stripe.Customer.create(description="Customer ::" + email, source=token)
    else:
        customer = stripe.Customer.create(description="Customer ::" + email)
    if customer:
        return customer
    else:
        return False


def create_subscription(customer_id, apps, selected_users, plan, discount, vat=None):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    print("test vat", vat)
    if vat == "True":
        subscription = stripe.Subscription.create(customer=customer_id, items=get_plans(apps, selected_users, plan, discount), tax_percent=settings.VAT['percent'])
    else:
        subscription = stripe.Subscription.create(customer=customer_id,items=get_plans(apps, selected_users, plan, discount))
    if subscription:
        return subscription
    else:
        return False


def get_data_by_subscription_id(subscription_id):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    subscription = stripe.Subscription.retrieve(subscription_id)
    return subscription

def get_all_invoice(customer):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    invoice = stripe.Invoice.list( customer=customer )
    return invoice

def update_subscription_by_user(customer_id, subscription_id, plan_id, quantity, proration_date):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    subscription = stripe.Subscription.retrieve(subscription_id)
    if subscription['items']['data']:
        for item in subscription['items']['data']:
            if item['plan']['id'] == plan_id:
                sub =stripe.Subscription.modify(subscription_id, items=[{"id": item.id, "quantity": quantity}], proration_date=proration_date)
                invoice = stripe.Invoice.upcoming(customer=customer_id, subscription=subscription_id, subscription_proration_date=proration_date)
                current_prorations = [ii for ii in invoice.lines.data if ii.period.start == proration_date]
                cost = sum([p.amount for p in current_prorations])
                retrived_sub = stripe.Subscription.retrieve(subscription_id)
                new_invoice = stripe.Invoice.create(customer=customer_id,subscription=subscription_id)
                new_invoice = new_invoice.pay()
                if new_invoice.paid:
                    retrived_sub.prorate = False
                    retrived_sub.save()
                else:
                    new_invoice.closed = True
                    new_invoice.save()
                return sub
    else:
        return False

def update_subscription_by_application(customer_id, subscription_id, plan,  proration_date):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    subscription = stripe.Subscription.retrieve(subscription_id)
    print("subscription::", subscription)
    if subscription['items']['data']:
        for item in subscription['items']['data']:
            sub =stripe.Subscription.modify(subscription_id, items=[{"plan": plan}], proration_date=proration_date)
            invoice = stripe.Invoice.upcoming(customer=customer_id, subscription=subscription_id, subscription_proration_date=proration_date)
            new_invoice = stripe.Invoice.create(customer=customer_id,subscription=subscription_id)
            new_invoice = new_invoice.pay()
            if new_invoice.paid:
                subscription.prorate = False
                subscription.save()
            else:
                new_invoice.closed = True
                new_invoice.save()
            return sub
    else:
        return False

def delete_subscription_item(customer_id, subscription_id, plan):
    stripe.api_key = settings.STRIPE_SETTINGS['stripe_key_test_secret']
    subscription = stripe.Subscription.retrieve(subscription_id)
    if subscription['items']['data']:
        for item in subscription['items']['data']:
            if item['plan']['id'] == plan:
                si = stripe.SubscriptionItem.retrieve(item['id'])
                si.prorate = False
                si.delete()
        new_invoice = stripe.Invoice.create(customer=customer_id, subscription=subscription_id)
        new_invoice = new_invoice.pay()
        if new_invoice.paid:
            subscription.prorate = False
            subscription.save()
        else:
            new_invoice.closed = True
            new_invoice.save()
        #return sub
        return True
    else:
        return False

def get_plans(apps, users, plan, discount):
    plans = []
    if len(apps) > 0 and users and discount:
        for app in apps:
            stripe_modules_plan_name = app + '-' + discount + '-percent-'+plan
            plans.append({"plan": settings.STRIPE_PLANS[stripe_modules_plan_name]})
        stripe_user_plan_name = 'user' + '-' + discount + '-percent-'+plan
        plans.append({"plan": settings.STRIPE_PLANS[stripe_user_plan_name], "quantity": users})

    print("ALL Plans::", plans)
    return plans

def check_vat_valid(vat_number=None):
    access_key ='ee53c5139b4daf6192a5dd6ad2a99272'
    if vat_number:
        api_url = 'http://apilayer.net/api/validate?access_key='+ access_key + '&vat_number='+vat_number
        result = requests.get(api_url)
        if result.status_code == 200:
            json_content = result.content.decode('utf-8')
            temp = json.loads(json_content)
            print("test", temp)
            if temp['valid']:
                return True
            else:
                return False
        else:
            return False
    else:
        return False
