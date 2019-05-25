from django.db import models


class Modules(models.Model):
    slug = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=50, blank=True)

    def cascade_delete(self):
        super(Modules, self).delete()

    class Meta:
        app_label = 'next_crm'
