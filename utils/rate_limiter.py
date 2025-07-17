
import time
from functools import wraps
from flask import request, jsonify
from typing import Dict, Tuple

class RateLimiter:
    def __init__(self):
        self.requests = {}  # IP -> {action: [(timestamp, count), ...]}
        self.limits = {
            'cv_upload': (5, 300),  # 5 requests per 5 minutes
            'cv_process': (10, 300),  # 10 requests per 5 minutes
            'default': (20, 300)  # 20 requests per 5 minutes
        }
    
    def is_allowed(self, ip: str, action: str = 'default') -> Tuple[bool, int]:
        """Check if request is allowed"""
        current_time = time.time()
        limit, window = self.limits.get(action, self.limits['default'])
        
        if ip not in self.requests:
            self.requests[ip] = {}
        
        if action not in self.requests[ip]:
            self.requests[ip][action] = []
        
        # Clean old requests
        self.requests[ip][action] = [
            (timestamp, count) for timestamp, count in self.requests[ip][action]
            if current_time - timestamp < window
        ]
        
        # Count current requests
        total_requests = sum(count for _, count in self.requests[ip][action])
        
        if total_requests >= limit:
            return False, window
        
        # Add current request
        self.requests[ip][action].append((current_time, 1))
        return True, 0

rate_limiter = RateLimiter()

def rate_limit(action: str = 'default'):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            ip = request.remote_addr
            allowed, retry_after = rate_limiter.is_allowed(ip, action)
            
            if not allowed:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': retry_after
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
