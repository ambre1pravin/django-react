from django.core.management.base import BaseCommand
import datetime, time
from datetime import datetime, timedelta
from django.conf import settings
import os
from django.core.mail import EmailMultiAlternatives
from next_crm.models import Customer_invoice, Contact, Company, EmailTemplate
from next_crm.helper.file_helper import create_pdf_from_url
from django.template.loader import render_to_string


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('minute', type=int, nargs='?', default=None)

    def handle(self, *args, **options):
        minute = options['minute']
        if minute == 60:
            now = datetime.now() + timedelta(days=5)
            invoices = Customer_invoice.objects.filter(due_date__lte = now.date(), status='open', email_sent_by_cron=False, checkbox_email=1)
            if invoices and len(invoices) > 0:
                for invoice in invoices:
                    customer = Contact.objects.get(id=invoice.customer_id)
                    customer_email = customer.email
                    customer_name  = customer.name
                    company = Company.objects.get(id=invoice.company)
                    company_logo = settings.HOST_NAME_WITHOUT_SLASH + company.profile_image if company.profile_image else None
                    currency = ' $ '
                    if company.currency == 'euro':
                        currency = ' € '
                    company_name = company.company
                    template = EmailTemplate.objects.get(id=invoice.email_template,company=invoice.company)
                    invoice_id = str(invoice.id)
                    invoice_name = invoice.name
                    if invoice_name:
                        file_name =  invoice.name.replace('/', '_') +'.pdf'
                    else:
                        file_name = int(time.time()) +'.pdf'
                    pdf_url = settings.HOST_NAME_WITHOUT_SLASH + '/customer/invoice/pdf_download/' + invoice_id

                    template_desc = template.description

                    if '[qname]' in template.subject:
                        subject = template.subject.replace('[qname]', invoice_name)

                    if '[customers]' in template_desc:
                        content = template_desc.replace('[customers]', customer_name)
                    if '[qname]' in template_desc:
                        content = content.replace('[qname]', customer_name)
                    if '[tamount]' in template_desc:
                        content = content.replace('[tamount]', str(invoice.total_amount)+currency)
                    if '[url]' in template_desc:
                        content = content.replace('[url]', pdf_url)

                    pdf_file_path = settings.BASE_DIR + '/media/temp_invoice/'  + file_name
                    return_status = create_pdf_from_url(pdf_url, pdf_file_path)
                    if return_status and customer_email:
                        result = EmailMultiAlternatives(subject, content, settings.EMAIL_FROM, [customer_email])
                        result.attach_file(return_status)
                        msgdata1 = content
                        msg_html = render_to_string('web/quotation/email.html',
                                                    {'msgdata1': msgdata1, 'saalz_logo': company_logo,
                                                     'company_name': company_name})
                        result.attach_alternative(msg_html, "text/html")
                        mail_sent = result.send()
                        if mail_sent:
                            print('Email sent for invoice', invoice.name)
                            invoice.email_sent_by_cron = True
                            invoice.email_sent_on = datetime.now().date()
                            invoice.save()
                            os.unlink(pdf_file_path)
            else:
                print("no invoice")
