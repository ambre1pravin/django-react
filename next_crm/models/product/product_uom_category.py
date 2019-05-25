import uuid
from django.db import models
from next_crm.models.company import Company
from django.contrib.auth.models import User


class Product_uom_category(models.Model):
	
	id         = models.AutoField(primary_key=True)
	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	name       = models.CharField(max_length=255, blank=True )
	create_uid = models.ForeignKey(User, models.SET_NULL, related_name= "uom_cate_updateby", db_index=True, blank=True,null=True, )
	update_uid = models.ForeignKey(User, models.SET_NULL, related_name= "uom_cate_createby", db_index=True, blank=True,null=True, )
	company 	= models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	created_at = models.DateTimeField(auto_now_add= True)
	updated_at = models.DateTimeField(auto_now= True )
	

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
