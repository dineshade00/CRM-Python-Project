from .models import Logos
from .signals import NOTIFICATIONS

def logo_context(request):
    logos = Logos.objects.order_by('-updated_at').first()
    return {'logos': logos}


def notifications_context(request):
    return {
        "notifications": NOTIFICATIONS
    }
