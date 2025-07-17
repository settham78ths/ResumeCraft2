import logging
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class NotificationSystem:
    def __init__(self):
        self.notifications = []

    def add_notification(self, message: str, type: str = 'info'):
        """Add notification to the system"""
        notification = {
            'message': message,
            'type': type,  # info, warning, error, success
            'timestamp': datetime.utcnow().isoformat()
        }
        self.notifications.append(notification)
        logger.info(f"Notification added: {message}")

    def get_notifications(self) -> List[Dict[str, Any]]:
        """Get all notifications"""
        return self.notifications

    def clear_notifications(self):
        """Clear all notifications"""
        self.notifications.clear()

notification_system = NotificationSystem()