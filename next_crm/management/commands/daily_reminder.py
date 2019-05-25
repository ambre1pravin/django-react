from django.core.management.base import BaseCommand
from next_crm.models import  Messages
from datetime import datetime
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string



class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('user_id', type=int, nargs='?', default=None)

    def handle(self, *args, **options):
        current_date = datetime.now().utcnow().date()
        messages = Messages.objects.all().select_related('user').filter(next_activity_reminder=current_date,mark_done=False)
        if messages:
            for msg in messages:
                email_message = {'username': str(msg.user.username),
                                 'text_1': msg.message,
                                 'text_2': None,
                                 'link': settings.HOST_NAME +'next-activity/',
                                 'link_text':'Next Activity'
                                 }
                email_subject = 'Reminder for '+ msg.message_type
                msg_html = render_to_string('web/email_template.html', {'email_message': email_message})
                send_mail(email_subject, 'test', settings.EMAIL_FROM, [msg.user.email],
                          fail_silently=True, html_message=msg_html)
