from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from next_crm.models.company import Company



class Lostreason(models.Model):

    id      = models.AutoField(primary_key=True)
    reason  = models.CharField(max_length=255, blank=True )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    created_at = models.DateTimeField(  default=timezone.now)


    def __unicode__(self):
        return self.reason

    class Meta:
        db_table = 'next_crm_op_lost_reason'