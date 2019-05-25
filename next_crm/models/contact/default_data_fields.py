from django.db import models
from django.contrib.postgres.fields import ArrayField


class DefaultDataFields(models.Model):

    id = models.AutoField(primary_key=True)
    module_id = models.IntegerField(blank=True,null=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255, blank=True)
    label = models.CharField(max_length=255)
    is_default = models.BooleanField(default=True)
    is_required = models.BooleanField(default=True)
    display_weight = models.IntegerField(blank=True,null=True)
    display_position = models.CharField(max_length=255)
    is_unused = models.BooleanField(default=True)
    default_values = ArrayField(models.CharField(max_length=200), blank=True)
    language = models.CharField(max_length=50, blank=True, default='English')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    

    def __unicode__(self):
        return self.name

    class Meta:
        db_table = 'next_crm_default_data_fields'