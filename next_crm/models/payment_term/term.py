from django.db import models
from django.contrib.auth.models import User
from next_crm.models.payment_term.payment_term  import Payment_term

class Term(models.Model):
	id				= models.AutoField(primary_key=True)
	due_type		= models.CharField(max_length=255, blank=True, null= True )
	value 			= models.CharField(max_length=255,blank=True,null=True)
	number_days		= models.CharField(max_length=255,blank=True,null=True)
	days            = models.CharField(max_length=255,blank=True,null=True)
	create_by_user	= models.ForeignKey(User, models.SET_NULL,related_name='t_create_by', db_index=True, blank=True,null=True, )
	update_by_user	= models.ForeignKey(User, models.SET_NULL,related_name='t_update_by',  db_index=True, blank=True,null=True, ) 
	payment_term    = models.ForeignKey(Payment_term, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
	created_at  	= models.DateTimeField(auto_now_add= True)
	updated_at  	= models.DateTimeField(auto_now= True )
	order			= models.IntegerField(default=0,db_index=True)

	def __str__(self):
		return self.due_type
	
	class Meta:
		app_label = 'next_crm'
