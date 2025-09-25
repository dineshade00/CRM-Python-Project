from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils.timezone import now
from .models import Member, Staff, LiveSession, OfflineSession, MemberInvoice, StaffInvoice, StaffSalary, StaffAttendance, MembershipPlan

# Shared notifications list (memory based - DB nahi)
NOTIFICATIONS = []

def add_notification(message, icon="mdi mdi-information", color="info"):
    NOTIFICATIONS.insert(0, {
        "message": message,
        "icon": icon,
        "color": color,
        "time": now().strftime("%H:%M %p")
    })
    if len(NOTIFICATIONS) > 20:   # max 20 recent keep
        NOTIFICATIONS.pop()

# -------- Member --------
@receiver(post_save, sender=Member)
def member_saved(sender, instance, created, **kwargs):
    if created:
        add_notification(f"New member registered: {instance.first_name}", "mdi mdi-account-plus-outline", "success")
    else:
        add_notification(f"Member updated: {instance.first_name}", "mdi mdi-update", "secondary")

@receiver(post_delete, sender=Member)
def member_deleted(sender, instance, **kwargs):
    add_notification(f"Member deleted: {instance.first_name}", "mdi mdi-account-remove-outline", "danger")

# -------- Staff --------
@receiver(post_save, sender=Staff)
def staff_saved(sender, instance, created, **kwargs):
    if created:
        add_notification(f"New staff added: {instance.first_name}", "mdi mdi-account-tie", "primary")
    else:
        add_notification(f"Staff updated: {instance.first_name}", "mdi mdi-update", "secondary")

@receiver(post_delete, sender=Staff)
def staff_deleted(sender, instance, **kwargs):
    add_notification(f"Staff deleted: {instance.first_name}", "mdi mdi-close-circle", "danger")

# -------- Live Session --------
@receiver(post_save, sender=LiveSession)
def live_session_saved(sender, instance, created, **kwargs):
    if created:
        add_notification(f"New live session: {instance.session_title}", "mdi mdi-calendar-check-outline", "info")
    else:
        add_notification(f"Live session updated: {instance.session_title}", "mdi mdi-update", "secondary")

# OfflineSession
@receiver(post_save, sender=OfflineSession)
def offline_session_saved(sender, instance, created, **kwargs):
    if created:
        add_notification(f"Offline session added: {instance.session_name}", "mdi mdi-calendar-clock", "warning")

# Invoice Example
@receiver(post_save, sender=MemberInvoice)
def member_invoice_created(sender, instance, created, **kwargs):
    if created:
        add_notification(f"Invoice generated for {instance.member_name}", "mdi mdi-cash-clock", "danger")
