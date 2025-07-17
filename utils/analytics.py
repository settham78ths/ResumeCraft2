import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger(__name__)

class Analytics:
    def __init__(self):
        self.events = []

    def track_event(self, event_name: str, user_id: int = None, properties: Dict[str, Any] = None):
        """Track analytics event"""
        event = {
            'event_name': event_name,
            'user_id': user_id,
            'properties': properties or {},
            'timestamp': datetime.utcnow().isoformat()
        }
        self.events.append(event)
        logger.info(f"Analytics event tracked: {event_name}")

    def get_events(self) -> list:
        """Get all tracked events"""
        return self.events

analytics = Analytics()