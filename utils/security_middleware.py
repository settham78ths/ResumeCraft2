from flask import request, jsonify
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    def __init__(self):
        self.blocked_ips = set()
        self.suspicious_patterns = [
            'script',
            'javascript:',
            '<script',
            'eval(',
            'document.cookie'
        ]

    def init_app(self, app):
        """Initialize security middleware with Flask app"""
        @app.before_request
        def security_check():
            return self.check_request()

    def check_request(self):
        """Check incoming request for security issues"""
        ip = request.remote_addr

        # Check blocked IPs
        if ip in self.blocked_ips:
            logger.warning(f"Blocked IP attempted access: {ip}")
            return jsonify({'error': 'Access denied'}), 403

        # Check for suspicious patterns in request data
        if request.is_json:
            data = request.get_json(silent=True)
            if data and self._contains_suspicious_content(str(data)):
                logger.warning(f"Suspicious content detected from {ip}")
                return jsonify({'error': 'Invalid request'}), 400

        # Check form data
        if request.form:
            for value in request.form.values():
                if self._contains_suspicious_content(value):
                    logger.warning(f"Suspicious form data from {ip}")
                    return jsonify({'error': 'Invalid request'}), 400

        return None

    def _contains_suspicious_content(self, content: str) -> bool:
        """Check if content contains suspicious patterns"""
        content_lower = content.lower()
        return any(pattern in content_lower for pattern in self.suspicious_patterns)

    def block_ip(self, ip: str):
        """Block IP address"""
        self.blocked_ips.add(ip)
        logger.info(f"IP blocked: {ip}")

security_middleware = SecurityMiddleware()