from django.db import models

class Countries(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=3, blank=False, null=False)
    label = models.CharField(max_length=100, blank=False, null=False)
    is_vat = models.BooleanField(default=False)
    is_europe = models.BooleanField(default=False)