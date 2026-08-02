from .models import Notification


def create_notification(recipient_type, recipient_id, title, message):
    return Notification.objects.create(
        recipient_type=recipient_type,
        recipient_id=recipient_id,
        title=title,
        message=message,
    )
