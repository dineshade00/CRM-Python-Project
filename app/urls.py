from django.urls import path ,include
from . import views

urlpatterns = [
   
############################################# User Management urls #############################################
   path('admin-register/', views.admin_register, name='admin-register'),
   path('otp-verification/', views.otp_verification, name='otp-verification'),
   path('', views.login, name='login'),
   path('logout/', views.logout_view, name='logout'),
   path("admin-other-details/", views.admin_other_details, name="admin-other-details"),
   path("admin-profile/", views.admin_show_profile, name="admin-profile"),


############################################# Home Management ###################################################
   path('dashboard/', views.home, name='home'),
   
############################################### Member Management url ###########################################
   path('add-new-member/', views.add_new_member, name='add-new-member'),  
   path('show-all-member/', views.show_all_member, name='show-all-member'),   
   path('update-member/<int:id>/', views.update_member, name='update-member'),
   path('member-details/<int:id>/', views.show_member_details, name='member-details'),
   path('delete-member/<int:id>', views.delete_member, name='delete-member'),

   
############################################### Staff Management url ###########################################
   path('add-new-staff/', views.add_new_staff, name='add-new-staff'),
   path('show-all-staff/', views.show_all_staff, name='show-all-staff'),
   path('manage-staff/<int:id>/', views.manage_staff, name='manage-staff'),
   path('delete-staff/<int:id>/', views.delete_staff, name='delete-staff'),

   
############################################### Account Management url ###########################################
   path("add-salary-account/", views.add_new_salary_account, name="add-salary-account"),
   path("show-all-account/", views.show_sallary_account, name='show-all-account'),
   path("delete-sallary-account/<int:pk>/", views.delete_sallary_account, name="delete-sallary-account"),
  # Invoice URLs
   path('create-invoice/', views.create_invoice, name='create-invoice'),
   path('payments/', views.payments, name='payments'),

############################################### Online Sesion url ###########################################
   path('live-session/', views.live_session, name='live-session'),
   path('meeting/<int:session_id>/', views.meeting_room, name='meeting-room'),
   path("edit-session/<int:session_id>/", views.edit_session, name="edit-session"),
   path("delete-session/<int:session_id>/", views.delete_session, name="delete-session"),

   

############################################### Offline Session url ###########################################

   path('offline-session/', views.offline_session, name='offline-session'),
   path("offline-session/delete/<int:session_id>/", views.delete_offline_session, name="delete-offline-session"),

############################################### Membership Plan Management Url ################################
   path("add-new-plan/", views.add_new_plan, name="add-new-plan"),
   path("view-plan/", views.view_plan, name="view-plan"),   
   path("plans/edit/<int:plan_id>/", views.edit_plan, name="edit-plan"),
   path("delete-plan/<int:plan_id>/", views.delete_plan, name="delete-plan"),

############################################### Reneval Management Url ########################################
   path('renewals/', views.renewals, name='renewals'),
   path("renew-plan/<int:member_id>/", views.renew_plan, name="renew-plan"),
   
############################################### Reports Url ##################################################
   path('membership-report/', views.membership_report, name='membership-report'),
   path('members-report/', views.membership_report_analysis, name="membership-reports"),
   path('revenue-report/', views.revenue_report, name='revenue-report'),
   path('generate-detailed-report/', views.generate_detailed_report, name='generate_detailed_report'),

############################################### Logo Setting Url #############################################
   path('logo-settings/', views.logo_settings, name='logo-settings'),

############################################### Attendance Url  ##############################################
   path('staff-attendance/', views.staff_attendendence, name="attendance"),

############################################### Trainer Profile ###############################################
   path('trainer-list/', views.trainer_profile, name="trainer-profile"),
   path("trainer/<int:trainer_id>/", views.trainer_profile_details, name="trainer_profile_details"),

############################################### Equipment  Management ###########################################
 
   path('add-equipment/', views.add_equipment, name='add-equipment'),
   path("show-equipment/", views.show_equipment, name="show-equipment"),   
   path("update-equipment/<int:pk>/", views.update_equipment, name="update-equipment"),   
   path("equipment/<int:id>/", views.equipment_detail, name="equipment-detail"),   
   path('delete-equipment/<int:id>/', views.delete_equipment, name='delete-equipment'),


############################################### Supplement Management ############################################
   path("supplement/add/", views.add_new_supplement, name="add-supplement"),
   path("supplement/delete/<int:sale_id>/", views.delete_supplement, name="delete-supplement"),

############################################## Settings Management ################################################

   path("settings/", views.settings_page, name="settings"),   
   path("delete-admin/<int:admin_id>/", views.delete_admin, name="delete-admin"),

]
