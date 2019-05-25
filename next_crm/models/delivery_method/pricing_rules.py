from django.db import models
from datetime import datetime
from django.contrib.auth.models import User

class Pricing_rules(models.Model):

	id						= models.AutoField(primary_key=True)
	delivery_id				= models.IntegerField(null=True, db_index=True) 
	condition_varible		= models.CharField(max_length=255, blank=True, null= True )
	condition_oprators		= models.CharField(max_length=255, blank=True, null= True )
	condition_price			= models.FloatField(null=True,blank=True)
	sale_price_1			= models.FloatField(null=True,blank=True)
	sale_price_2			= models.FloatField(null=True,blank=True)
	sale_price_varible		= models.CharField(max_length=255, blank=True, null= True )
	create_by_user			= models.ForeignKey(User, models.SET_NULL,related_name='pr_create_by', db_index=True, blank=True,null=True, )
	update_by_user			= models.ForeignKey(User, models.SET_NULL,related_name='pr_update_by',  db_index=True, blank=True,null=True, )  
	company         		= models.IntegerField(null=True, db_index=True)
	created_at  			= models.DateTimeField(auto_now_add= True)
	updated_at  			= models.DateTimeField(auto_now= True )

	def __str__(self):
		return self.condition_varible
	
	class Meta:
		app_label = 'next_crm'
