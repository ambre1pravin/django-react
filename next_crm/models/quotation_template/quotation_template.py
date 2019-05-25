import uuid
from django.db import models
from datetime import datetime
from django.contrib.auth.models import User
from next_crm.models.company import Company
from datetime import datetime, timedelta



class Quotation_template(models.Model):
	
	id                       = models.AutoField(primary_key=True)
	uuid 					= models.UUIDField(default=uuid.uuid4, editable=False)
	name                     = models.CharField(max_length=255, blank=True )
	company 				= models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
	created_at               = models.DateTimeField(auto_now_add= True)
	updated_at               = models.DateTimeField(auto_now= True )
	create_by_user           = models.ForeignKey(User, models.SET_NULL,related_name='quot_tmpl_create_by', db_index=True, blank=True,null=True, )
	update_by_user           = models.ForeignKey(User, models.SET_NULL,related_name='quot_tmpl_update_by',  db_index=True, blank=True,null=True, )
	terms_and_codition       = models.TextField(blank=True,null=True)  #terms and condition will be displyed on quotation 
	expiration_delay         = models.IntegerField(default=30, db_index=True, null=True)#quotation vaildity date
	expiration_date 		 = models.DateField(auto_now_add = False)
	is_default			     = models.BooleanField(default=False,db_index=True )
	is_deleted			     = models.BooleanField(default=False,db_index=True )
	amount_untaxed           = models.FloatField(null=True)
	tax_amount               = models.FloatField(null=True)
	total_amount             = models.FloatField(null=True)
	opamount_untaxed         = models.FloatField(null=True)
	optax_amount             = models.FloatField(null=True)
	optotal_amount           = models.FloatField(null=True)
	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
