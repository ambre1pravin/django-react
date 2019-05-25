from django.http import HttpResponse
from datetime import date,datetime
import datetime
from django.conf import settings
import json
from next_crm.models import Sale_order,Email_reminder,EmailSendDate,Term,Payment_register,Customer_invoice,EmailTemplate,Sale_order_record,ContactFieldsValue, Quotation_template, Quotation_template_record, Payment_term, Delivery_method
from django.core.mail import EmailMultiAlternatives
from dateutil.relativedelta import relativedelta
import urllib.request  as urllib2
from django.template.loader import render_to_string
from django.core.mail import send_mail

#msg        = 'chootiye Dear'
#subject    = 'teste Mail'
#result = send_mail(subject, msg, 'sohampatel1908@gmail.com', ['100hampatel@gmail.com'], fail_silently=False,)

def automatedinvoiceemail(self):

	data         	= {}
	TODAY 			=  datetime.date.today()
	From 			= 'crm@sitenco.com'
	subject       	= 'tested Mail'

	mon_rel = relativedelta(days=5)
	du_date = TODAY + mon_rel
	text_content = "k"
	Customer = Customer_invoice.objects.filter(due_date=du_date,checkbox_email=1)
	for o in Customer:
		qname = o.name if o.name!='' else 'invoice'
			
		email_template 	= getEmailTemplate(o.email_template,o.customer_name,o.total_amount,qname,o.id)
		msgdata      	= email_template['description']
		subject       	= email_template['subject']
		filename 		= "%s.pdf" %(qname+'_' +o.customer_name)
		image_path      = email_template['image_path']

		mainurl 			= settings.HOST_NAME
		pdf_url 			= mainurl +'customer/invoice/pdf_download/'+ str(o.id)
		pdf = file_get_contents(pdf_url)


		email_list      = getCustomerEmailAddr(o.customer_id)
		for x in email_list:
			email_list = x['email_list']

			if email_list !='' and email_list != None:
				result = EmailMultiAlternatives(subject, text_content, From, [email_list])
				result.attach_alternative(msgdata, "text/html")
				result.attach(filename, pdf, 'application/pdf')
				if image_path !='' and image_path != None:
					for attachment2 in image_path:
						attachment ='media/email/'+ attachment2
						result.attach_file(attachment)
				result.send()
				data['success'] = True
			else:
				data['success'] = True

	return HttpResponse(json.dumps(data), content_type="application/json")

def getCustomerEmailAddr(id_list):

	email_list = []

	contact_field_valuet = ContactFieldsValue.objects.select_related('contact','contact_field').all()
	contact_field_value = contact_field_valuet.all().filter(contact_id = (int(id_list)))
	for ct in contact_field_value:
		if ct.contact_field.name == "email" and ct.contact_field.is_default:
	
			email_list.append({'email_list': ct.contact_field_value})
	return email_list	


def getEmailTemplate(email_template_id,customer_name,total_amount,qname,id,quotation):

	data = {}
	data['success'] = False

	email_template_objs = EmailTemplate.objects.get(id=email_template_id)

	if email_template_objs.image_path != '' and email_template_objs.image_path is not None :
		image_path_eml_list = email_template_objs.image_path.split('|')
	else:
		image_path_eml_list = None

	if image_path_eml_list !='' and image_path_eml_list is not None:
		image_path_eml_list = image_path_eml_list

	description 		= email_template_objs.description
	subject 			= email_template_objs.subject
	mainurl 			= settings.HOST_NAME


	if quotation == 'quotation':
		pdf_url 			= mainurl +'quotation/pdf_download/'+ str(id)
	else:
		pdf_url 			= mainurl +'customer/invoice/pdf_download/'+ str(id)


	view_center 		= '<center style="color: rgb(0, 0, 0); font-family: Roboto; font-size: medium;"><a href= [pdf_url] style="background-color: rgb(26, 188, 156); color: rgb(255, 255, 255); border-radius: 5px; font-size: 16px; padding: 20px;">View quotation online</a>&nbsp;<br><br><br><span style="color: rgb(136, 136, 136);">(or view attached PDF)</span></center>';
	view_center1 		= view_center.replace('[pdf_url]', pdf_url);

	subject				= subject.replace('[qname]', qname).replace('[customers]',customer_name).replace('[tamount]',str(total_amount));
	txtEditor 			= description.replace('[qname]', qname).replace('[customers]',customer_name).replace('[tamount]',str(total_amount)).replace('[url]',view_center1);

	Invoicing_data = {'id'            : email_template_objs.id, 
					'name'            : email_template_objs.name,
					'subject'   	  : subject,
					'description'     : txtEditor,
					'image_path'      : image_path_eml_list,

	}
	return Invoicing_data

def file_get_contents(url):
    url = str(url).replace(" ", "+") # just in case, no space in url
    hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
           'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
           'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
           'Accept-Encoding': 'none',
           'Accept-Language': 'en-US,en;q=0.8',
           'Connection': 'keep-alive'}
    req = urllib2.Request(url, headers=hdr)
    page = urllib2.urlopen(req)
    
    return page.read()

def reminder_email(self):
	print('reminder_emailreminder_emailreminder_emailreminder_emailreminder_emailreminder_email')
	data         	= {}
	TODAY 			=  datetime.date.today()
	From 			= 'crm@sitenco.com'
	subject       	= 'tested Mail'

	mon_rel = relativedelta(days=5)
	du_date = TODAY + mon_rel
	text_content = "k"
	email_re = EmailSendDate.objects.all()
	now = datetime.datetime.now()

	date1 = now.strftime("%d")
	date = now.strftime("%d").lstrip("0").replace("0"," ")

	month = now.strftime("%m").lstrip("0").replace("0"," ")
	week = datetime.date.today().strftime("%w")
	year =datetime.date.today().strftime("%j") 

	for x in email_re:

		sale_id 	= x.sale_id
		send_date   = x.date
		sale_id_confirm = confirmSale(sale_id)

		send_year = send_date.strftime("%Y") 
		if sale_id_confirm !='':
			email_obj 	= Email_reminder.objects.filter(sale_id = sale_id_confirm)
			for x in email_obj:
				fine = str(x.numbers)

				if x.event_type =='day':
					if date == fine:
						sendData = autoRemindermailSend(x.sale_id,x.email_template_id)
				elif x.event_type =='weeks':
					if week == fine:
						sendData = autoRemindermailSend(x.sale_id,x.email_template_id)
				elif x.event_type =='month':
					if month == fine:
						sendData = autoRemindermailSend(x.sale_id,x.email_template_id)	
				elif x.event_type =='year':
					todaye = datetime.date.today()
					yer = int(send_year) + int(x.numbers)
					edidate = datetime.date(yer, 1, 1)
					if edidate == todaye:
						sendData = autoRemindermailSend(x.sale_id,x.email_template_id)

	return HttpResponse(json.dumps(data), content_type="application/json")


def confirmSale(sale_id):
	quotation =''
	quatations_objs = Sale_order.objects.filter(id =sale_id).exclude(status ='sale').order_by('id')
	for quatations in quatations_objs:
		quotation = int(quatations.id)

	return quotation

def autoRemindermailSend(sale_id,email_template_id):

	data         	= {}
	TODAY 			=  datetime.date.today()
	From 			= 'crm@sitenco.com'
	subject       	= 'tested Mail'
	text_content = "k"

	Customer = Sale_order.objects.filter(id=sale_id)
	for o in Customer:
		qname = o.name

		email_template 	= getEmailTemplate(email_template_id,o.customer_name,o.total_amount,qname,o.id,'quotation')
		
		msgdata      	= email_template['description']
		subject       	= email_template['subject']
		filename 		= "%s.pdf" %(qname+'_' +o.customer_name)
		image_path      = email_template['image_path']

		mainurl 			= settings.HOST_NAME
		pdf_url 			= mainurl +'quotation/pdf_download/'+ str(o.id)

		pdf = file_get_contents(pdf_url)


		email_list      = getCustomerEmailAddr(o.customer_id)
		for x in email_list:
			email_list = x['email_list']
			if email_list !='' and email_list != None:
				result = EmailMultiAlternatives(subject, text_content, From, [email_list])
				# result = EmailMultiAlternatives(subject, text_content, From, [recipients_arr])
				msgdata1 = msgdata
				msg_html = render_to_string('web/quotation/email.html', {'msgdata1': msgdata1})
				result.attach_alternative(msg_html, "text/html")
				result.attach(filename, pdf, 'application/pdf')
				if image_path !='' and image_path != None:
					for attachment2 in image_path:
						attachment ='media/email/'+ attachment2
						result.attach_file(attachment)
				result.send()
				data['success'] = True
			else:
				data['success'] = True

	return data




