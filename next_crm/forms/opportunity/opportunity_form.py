from django import forms
from next_crm.models.opportunity.opportunity import Opportunity

class OpportunityForm(forms.ModelForm):

    class Meta:
        model = Opportunity
        fields = '__all__'
