from next_crm.models import Company
from datetime import date, datetime, time, timedelta

def get_currency_name(company_id):
    currency ='$'
    try:
        company = Company.objects.get(id=company_id)
        if company:
            if company.currency == 'euro':
                currency = '€'
            else:
                currency = '$'
    except Company.DoesNotExist:
        print("company Does not exit")
    return currency

def format_date(order_date, currency):
    return_date = None
    if order_date:
        if currency == 'euro':
            return_date = datetime.strptime(str(order_date), "%Y-%m-%d").strftime("%d/%m/%Y")
        else:
            return_date = datetime.strptime(str(order_date), "%Y-%m-%d").strftime("%Y-%m-%d")
    return return_date
