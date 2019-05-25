from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Product_attribute(models.Model):
	
	id             = models.AutoField(primary_key=True)
	name           = models.CharField(max_length=255, blank=True )
	create_by_user = models.ForeignKey(User, models.SET_NULL,related_name='product_attr_createdby', db_index=True, blank=True,null=True, )
	update_by_user = models.ForeignKey(User, models.SET_NULL,related_name='product_attr_updateby',  db_index=True, blank=True,null=True, )		
	created_at     = models.DateTimeField(  auto_now_add= True)
	updated_at     = models.DateTimeField(  auto_now= True)
	

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
