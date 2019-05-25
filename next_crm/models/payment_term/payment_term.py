import uuid
from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company

class Payment_term(models.Model):
	id = models.AutoField(primary_key=True)
	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	name = models.CharField(max_length=255, blank=True, null= True )
	notes = models.TextField(blank=True,null=True)
	status = models.BooleanField(default=True)
	create_by_user = models.ForeignKey(User, models.SET_NULL,related_name='pt_create_by', db_index=True, blank=True,null=True, )
	update_by_user = models.ForeignKey(User, models.SET_NULL,related_name='pt_update_by',  db_index=True, blank=True,null=True, )
	company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
	created_at = models.DateTimeField(auto_now_add= True)
	updated_at = models.DateTimeField(auto_now= True )

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
