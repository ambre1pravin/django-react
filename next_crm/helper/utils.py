import base64
from PIL import Image
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from datetime import datetime, timedelta
import base64
from django.conf import settings
import subprocess, os, mimetypes
from django.http import HttpResponse
from decimal import Decimal


class Utils:
    def __init__(self):
        return

    def comma_sep_value(self, value):
        try:
            if type(value).__name__ == 'list':
                return ",".join(value)
            else:
                return value
        except:
            pass

    def get_language(self, http_accept_lang):
        l = [x.strip()[:2] for x in http_accept_lang.split(',')][:1]
        if l[0] == 'en':
            return 'English'
        else:
            return 'French'

    def round_value(self, value):
        return_value = 0.00
        if value:
            return_value =  float(round(Decimal("{:10.2f}".format(value)), 2))
        return  return_value

    def get_profile_color(self, number):
        remainder = number % 10
        if remainder == 0:
            remainder = 1
        return settings.COLOR_CODES[remainder]

    def resize_file(in_file, out_file):
        img = Image.open(in_file)  # image extension *.png,*.jpg
        new_width = 90
        new_height = 90
        img = img.resize((new_width, new_height), Image.ANTIALIAS)
        img.save(out_file)  # format may what u want ,*.png,*jpg,*.gif

    def get_uniq_list(self,input):
        output = []
        for x in input:
            if x not in output:
                output.append(x)
        return output

    def encrypt_val(self, clear_text):
        import hashlib
        return hashlib.md5(str(clear_text).encode('utf-8')).hexdigest()
        #return base64.b64encode(bytes(Str, 'utf-8'))

    def decrypt_val(self, cipher_text):
        decript_str =  base64.b64decode(cipher_text.decode('utf-8')).decode()
        print(decript_str)
        return decript_str


    def send_activation(self, user, profile, invited=False):
        if invited:
            activation_link = settings.HOST_NAME + 'user/invite/activate' + '/' + profile.activation_key + '/'
        else:
            activation_link = settings.HOST_NAME + 'user/activate' + '/' + profile.activation_key+ '/'
        email_message ={'username': str(user.username),
                        'text_1': 'To complete your registration, please click on this link below.',
                        'text_2':'If the link does not work, please Copy the full URL link above and Paste into your web browser URL address box.',
                        'link': activation_link,
                        'link_text':'Activate'
                        }

        email_subject = 'Confirm Your Crm Account.'
        msg_html = render_to_string('web/email_template.html', {'email_message': email_message})
        send_mail(email_subject, 'test', settings.EMAIL_FROM, [user.email],
                  fail_silently=True, html_message=msg_html)

    def reset_password(self, user, profile):
        activation_link = settings.HOST_NAME + 'reset-password' + '/' + profile.activation_key
        email_subject = 'Rest your password'
        email_message ={'username': str(user.username),
                        'text_1': 'To reset your password, please click on this link below.',
                        'text_2':None,
                        'link': activation_link,
                        'link_text': 'Rest Password'
                        }
        msg_html = render_to_string('web/email_template.html', {'email_message': email_message})
        send_mail(email_subject, 'test', settings.EMAIL_FROM, [user.email],
                  fail_silently=True, html_message=msg_html)

    def send_invitation(self, invites_user, user_obj, profile):
        link = settings.HOST_NAME + 'login' + '/'
        email_subject = 'Invitation.'
        text_2 = 'Your credentials are Username : ' + str(user_obj.username) + ', Password : ' + str(profile.temp_pass)
        email_message ={'username': str(user_obj.username),
                        'text_1': str(invites_user) + " invite you on" ,
                        'text_2':text_2,
                        'link': link,
                        'link_text': 'Login'
                        }
        msg_html = render_to_string('web/email_template.html', {'email_message': email_message})
        send_mail(email_subject, 'test' , settings.EMAIL_FROM, [user_obj.email],
                  fail_silently=True, html_message=msg_html)

    def get_login_period(self, date_join):
        current_datetime = datetime.now().utcnow()
        expire_in_hours = date_join + timedelta(hours=4)
        expire_date = date_join + timedelta(days=14)

        expire_days = abs(int((expire_date.date() - current_datetime.date()).days))
        unaware = datetime(expire_in_hours.year, expire_in_hours.month, expire_in_hours.day, expire_in_hours.hour,
                           expire_in_hours.minute, expire_in_hours.second)
        login_hours = abs( int(round(((unaware - current_datetime).total_seconds()) / 3600)))

        trial_over_days = datetime.now().date() - expire_date.date()
        data_delete_date =  date_join + timedelta(days=21)

        left_days =  (expire_date.date() -  datetime.now().date()).days

        print({'expire_days':expire_days,'login_hours':login_hours, 'trial_over_days':trial_over_days.days,
                'data_delete_date':data_delete_date.date(),'left_days':left_days})
        return {'expire_days':expire_days,'login_hours':login_hours, 'trial_over_days':trial_over_days.days,
                'data_delete_date':data_delete_date.date(),'left_days':left_days}

    def sent_email_from_messgage(self, sender_email, users, text):
        email_subject = 'Email from Salz'
        email_message = {'text_1': text}
        msg_html = render_to_string('web/email_template.html', {'email_message': email_message})
        send_mail(email_subject, 'test', sender_email, users,
                  fail_silently=True, html_message=msg_html)

    def set_default_template(self, lan, module_type):
        template = {'template_name':'','subject':'', 'description':''}
        if lan == 'en' and module_type == 'quotation':
            template['template_name'] ='Quotation default mail template'
            template['subject'] = 'Your Quotation [qname]'
            template_desc = "<p>Dear [LastName],</p><p><br></p><p>Please kindly find your Quotation [qname] with total amount of [tamount]</p><p> You can view it online by clicking there:</p>"
            template_desc +="<p>[url]</p><p><br></p><p>Best Regards</p>"
            template['description'] = template_desc
        elif lan == 'fr' and module_type == 'quotation':
            template['template_name'] ='Modèle par défaut (devis)'
            template['subject'] = 'Votre devis [qname]'
            template_desc = "<p>Bonjour Monsieur [LastName],</p><p><br></p><p>Conformément à votre demande, veuillez trouver ci - joint notre devis [qname] </p><p> Pour le consulter  en ligne veuillez cliquer sur ce lien: </p><p>[url]</p><p><br></p><p> Nous restons à votre disposition pour tous renseignements complémentaires</p><p><br></p><p>Cordialement</p>"
            template['description'] = template_desc
        elif lan == 'en' and module_type == 'sales-order':
            template['template_name'] ='Sales Order default mail template'
            template['subject'] = 'Your Sales Order'
            template_desc = "<p>Dear [LastName],</p>"
            template_desc +="<p><br></p>"
            template_desc += "<p>Please kindly find your Sales Order [qname]</p>"
            template_desc += "<p>You can view it online by clicking there:</p>"
            template_desc += "<p>[url]</p>"
            template_desc += "<p><br></p>"
            template_desc += "<p>Best Regards</p>"
            template['description'] = template_desc
        elif lan == 'fr' and module_type == 'sales-order':
            template['template_name'] ='Modèle par défaut (bon de commande)'
            template['subject'] = ' Votre bon de commande'
            template_desc ="<p>Bonjour Monsieur [LastName],</p><p><br></p><p> Veuillez trouver ci - joint votre bon de commande [qname]</p>"
            template_desc +="<p>Pour le consulter en ligne veuillez cliquer sur ce lien:</p>"
            template_desc += "<p>[url]</p>"
            template_desc += "<p><br></p>"
            template_desc += "<p>Nous restons à votre disposition pour tous renseignements complémentaires</p>"
            template_desc += "<p><br></p>"
            template_desc += "<p>Cordialement</p>"
            template['description'] = template_desc
        elif lan == 'en' and module_type == 'invoice':
            template['template_name'] ='Invoice default mail template'
            template['subject'] = 'Your invoice [qname]'
            template_desc ="<p>Dear [LastName],</p><p><br></p><p>Here is the invoice [qname] amounting in [tamount]</p><p>[url]</p><p><br></p><p>Please remit payment before the [duedate]</p><p><br></p><p>Best Regards.</p>"
            template['description'] = template_desc
        elif lan == 'fr' and module_type == 'invoice':
            template['template_name'] ='Modèle par défaut (facture)'
            template['subject'] = 'Votre facture [qname]'
            template_desc = "<p>Bonjour Monsieur [LastName],</p>"
            template_desc += "<p><br></p><p>Voici votre facture numéro [qname] d'un montant total de [tamount] à régler au plus tard le [duedate]</p>"
            template_desc += "<p>Vous pouvez consulter votre facture en ligne en cliquant sur le bouton ci-dessous: [url] </p>"
            template_desc += "<p>(ou télécharger la pièce jointe)</p><p><br></p><p>Nous restons à votre disposition pour tous renseignements complémentaires.</p>"
            template_desc += "<p><br></p><p>Cordialement</p>"
            template['description'] = template_desc
        elif lan == 'en' and module_type == 'contact' or module_type == 'opportunity':
            template['template_name'] ='Contact default template'
            template['subject'] = 'CRM'
            template_desc ="<p>Dear [LastName],</p><p><br></p><p>Best Regards.</p>"
            template['description'] = template_desc
        elif lan == 'fr' and module_type == 'contact' or module_type == 'opportunity':
            template['template_name'] ='Contact default template'
            template['subject'] = 'CRM'
            template_desc ="<p>Dear [LastName],</p><p><br></p><p>Best Regards.</p>"
            template['description'] = template_desc
        return template


    def generate_pdf_from_url(self, header_url, footer_url, content_url, file_path):
        subprocess.check_call(['wkhtmltopdf',
                               '--print-media-type',
                               '--header-html',
                               header_url,
                              '--footer-html',
                               footer_url,
                               content_url,
                               file_path])
        '''subprocess.check_call(['xvfb-run', 'wkhtmltopdf',
                               '--print-media-type',
                               '--header-html',
                               header_url,
                              '--footer-html',
                               footer_url,
                               content_url,
                              file_path])'''

        if os.path.exists(file_path):
            with open(file_path, 'rb') as fh:
                content_type = mimetypes.guess_type(file_path)[0]
                response = HttpResponse(fh.read(), content_type=content_type)
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
                return response
        else:
            error_message = os.path.basename(file_path) +' was not created.'
            return HttpResponse(error_message)