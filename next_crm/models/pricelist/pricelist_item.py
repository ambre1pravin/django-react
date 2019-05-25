from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Pricelist_item(models.Model):
	 
	id             = models.AutoField(primary_key=True)
	applied_on     = models.CharField(max_length=255, blank=True , null= True, db_index=True )
	min_qty        = models.IntegerField(null=True, db_index=True ) 
	start_date     = models.DateField(auto_now=False, auto_now_add=False, blank=True , null= True)
	end_date       = models.DateField(auto_now=False, auto_now_add=False, blank=True , null= True)
	fixed_price    = models.FloatField(null=True, blank=True)
	price_discount = models.FloatField(null=True, blank=True)
	price_compute  = models.CharField(max_length=50, blank=True, null=True )
	base           = models.CharField(max_length=100, blank=True, null=True )
	pro_category   = models.ForeignKey(User, models.SET_NULL,related_name='category_price_list', db_index=True, blank=True,null=True, )
	product        = models.ForeignKey(User, models.SET_NULL,related_name='product_price_list', db_index=True, blank=True,null=True, )
	surcharge      = models.FloatField(null=True, blank=True)
	currency_id    = models.IntegerField(null=True, db_index=True)
	create_by      = models.ForeignKey(User, models.SET_NULL,related_name='pricelist_item_create_by', db_index=True, blank=True,null=True, )
	update_by      = models.ForeignKey(User, models.SET_NULL,related_name='pricelist_item_update_by',  db_index=True, blank=True,null=True, )
	company        = models.IntegerField(null=True, db_index=True)
	created_at     = models.DateTimeField(auto_now_add= True)
	updated_at     = models.DateTimeField(auto_now= True )

	def __str__(self):
		return self.applied_on
	
	class Meta:
		app_label = 'next_crm'
