from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Pricelist(models.Model):
	
	id                   = models.AutoField(primary_key=True)
	name                 = models.CharField(max_length=255, blank=True , null= True, db_index=True )
	pricelist_type       = models.CharField(max_length=255, blank=True , null= True, db_index=True ) #it should be Sale PriceList Or Purchase Pricelist
	currency_id          = models.IntegerField(null=True, db_index=True)
	create_by            = models.ForeignKey(User, models.SET_NULL,related_name='pricelist_create_by', db_index=True, blank=True,null=True, )
	update_by            = models.ForeignKey(User, models.SET_NULL,related_name='pricelist_update_by',  db_index=True, blank=True,null=True, )
	company              = models.IntegerField(null=True, db_index=True)
	created_at           = models.DateTimeField(auto_now_add= True)
	updated_at           = models.DateTimeField(auto_now= True )
	active               = models.BooleanField(default=True )


	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
