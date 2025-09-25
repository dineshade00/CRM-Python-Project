from django.contrib import admin
from .models import Member , StaffSalary  # import your model
from .models import StaffInvoice, MemberInvoice
from .models import LiveSession,  OfflineSession , MembershipPlan 
from .models import Logos , StaffAttendance, UserAccount, ProteinsSale

# Register Your Models Here 
admin.site.register(Member)  
admin.site.register(StaffSalary) 
admin.site.register(StaffInvoice)
admin.site.register(MemberInvoice)
admin.site.register(LiveSession)
admin.site.register( OfflineSession)
admin.site.register(MembershipPlan)
admin.site.register(Logos)
admin.site.register(StaffAttendance)
admin.site.register(UserAccount)
admin.site.register(ProteinsSale)