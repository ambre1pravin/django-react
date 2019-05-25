from django.core.management.base import BaseCommand
#from django.conf import settings
import subprocess, os, mimetypes
#from django.core.mail import send_mail



class Command(BaseCommand):
    def handle(self, *args, **options):
        #pdfkit.from_url('https://reporting.stylophane.com/view-report/64/', 'micro.pdf')

        subprocess.check_call(['wkhtmltopdf',
                               '--header-line',
                               '--print-media-type',
                               'https://reporting.stylophane.com/view-report/64/',
                              '/Users/suyash/Sites/next_crm/hh.pdf'])



        '''print("Emails:",settings.EMAIL_FROM, settings.EMAIL_HOST,settings.EMAIL_PORT,settings.EMAIL_HOST_USER,settings.EMAIL_HOST_PASSWORD)
        email_subject= 'Cron tab '
        email_message = 'This is test'
        send_mail(email_subject, email_message, settings.EMAIL_FROM, ['suyash343@gmail.com'],
                  fail_silently=True, html_message=email_message)'''




