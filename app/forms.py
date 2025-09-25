# app/forms.py
from django import forms
from .models import UserAccount
from .models import Equipment

class AdminRegisterForm(forms.ModelForm):
    agreed_terms = forms.BooleanField(required=True)
    
    class Meta:
        model = UserAccount
        fields = ['email', 'username', 'password', 'agreed_terms']
        widgets = {
            'password': forms.PasswordInput(),
        }



class EquipmentForm(forms.ModelForm):
    class Meta:
        model = Equipment
        fields = [
            'equipment_name',
            'category',
            'brand',
            'purchase_date',
            'status',
            'location',
            'maintenance_date',
            'image'
        ]