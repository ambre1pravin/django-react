from django import forms

class OpAttachForm(forms.Form):
    opportunity_id = forms.CharField(max_length = 100)
    attached_file  = forms.FileField()