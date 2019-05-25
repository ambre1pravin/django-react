from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from django.contrib.auth.models import User
from next_crm.models.opportunity.column import Column 
from next_crm.models.opportunity.sales_channel import  SalesChannel
from next_crm.models.opportunity.lost_reason import  Lostreason
from next_crm.models.opportunity.opportunity_leadsource import  OpportunityLeadsource
from next_crm.models.contact.contact import Contact
from next_crm.models.company import Company

class Opportunity (models.Model):

    id                = models.AutoField(primary_key=True)
    name              = models.CharField(max_length=255, blank=True )
    estimated_revenue = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
    probability       = models.CharField(max_length=255,null=True)
    customer          = models.ForeignKey(Contact, models.SET_NULL, db_index=True, blank=True,null=True, )
    expected_closing  = models.DateField(blank=True, null=True)
    lead_source       = models.ForeignKey(OpportunityLeadsource, models.SET_NULL, db_index=True, blank=True,null=True, )
    sales_person      = models.ForeignKey(User, models.SET_NULL, db_index=True, blank=True,null=True, related_name='sales_person',)
    sales_channel     = models.ForeignKey(SalesChannel, on_delete=models.CASCADE, db_index=True, blank=False, null=False )
    rating            = models.CharField(max_length=255,null=True)
    tags              = ArrayField(models.IntegerField(), blank=True, null=True)
    column            = models.ForeignKey(Column, db_index=True, on_delete=models.CASCADE, blank=False, null=False )
    user              = models.ForeignKey(User, db_index=True, on_delete=models.CASCADE, blank=False, null=False )
    company           = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False )
    order             = models.IntegerField(default=0, db_index=True)
    card_color        = models.CharField(max_length=50, default='card-white',blank=True, null=True)
    is_active         = models.BooleanField(default=True)
    is_won            = models.BooleanField(default=False)
    is_lost           = models.BooleanField(default=False)
    is_open           = models.BooleanField(default=True)
    lostreason        = models.ForeignKey(Lostreason, models.SET_NULL, db_index=True, blank=True,null=True, )   
    internal_notes    = models.TextField(blank=True, null=True)
    created_at        = models.DateTimeField(  default=timezone.now)


    def __unicode__(self):
        return self.name

    class Meta:
        app_label = 'next_crm'



