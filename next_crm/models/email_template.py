from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company



class EmailTemplate(models.Model):

  id             	= models.AutoField(primary_key=True)
  name              = models.CharField(max_length=255, blank=True )
  subject           = models.CharField(max_length=255, blank=True )
  template_name     = models.CharField(max_length=255, blank=False, default='Default template')
  description       = models.TextField(blank=True,null=True)
  module_type       = models.CharField(default = 'QUOTATION', max_length=255)
  image_path        = models.CharField(max_length=255, blank=True , null= True)
  company           = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
  create_by_user    = models.ForeignKey(User, models.SET_NULL,related_name='email_create_by', db_index=True, blank=True,null=True, )
  update_by_user    = models.ForeignKey(User, models.SET_NULL,related_name='email_update_by',  db_index=True, blank=True,null=True, )
  is_deleted        = models.BooleanField(default=False)
  is_default        = models.BooleanField(default=False)
  
  def __unicode__(self):
        return self.name

  def cascade_delete(self):
    super(EmailTemplate, self).delete()

  class Meta:
    db_table = 'next_crm_email_template'
