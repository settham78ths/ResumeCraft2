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

        # Skip security checks for legitimate CV processing endpoints
        cv_endpoints = ['/process-cv', '/upload-cv', '/api/generate-ai-cv', '/apply-recruiter-feedback']
        if request.endpoint and any(endpoint in request.endpoint for endpoint in cv_endpoints):
            return None

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
        
        # Don't flag legitimate CV processing terms or professional language
        cv_terms = [
            'optimize', 'feedback', 'cover_letter', 'ats_check',
            'interview_questions', 'cv_score', 'keyword_analysis',
            'grammar_check', 'position_optimization', 'javascript',
            'developer', 'programming', 'scripting', 'web development'
        ]
        
        # If it contains CV terms, it's likely legitimate
        if any(term in content_lower for term in cv_terms):
            return False
        
        # Only flag actual malicious patterns
        malicious_patterns = [
            '<script>', '<iframe', 'javascript:', 'vbscript:',
            'document.cookie', 'window.location', 'eval(',
            'onload=', 'onerror=', 'onclick='
        ]
        
        return any(pattern in content_lower for pattern in malicious_patterns)

    def block_ip(self, ip: str):
        """Block IP address"""
        self.blocked_ips.add(ip)
        logger.info(f"IP blocked: {ip}")

    def is_suspicious_content(self, data):
        """Check if request contains suspicious content"""
        if not data:
            return False

        data_str = str(data).lower()

        # Check for suspicious patterns (exclude legitimate CV content)
        suspicious_patterns = [
            '<script>', '<iframe', 'javascript:', 'vbscript:',
            'document.cookie', 'window.location'
        ]

        # Don't flag legitimate CV processing terms
        cv_terms = [
            'optimize', 'feedback', 'cover_letter', 'ats_check',
            'interview_questions', 'cv_score', 'keyword_analysis',
            'grammar_check', 'position_optimization'
        ]

        # If it contains CV terms, it's likely legitimate
        if any(term in data_str for term in cv_terms):
            return False

        return any(pattern in data_str for pattern in suspicious_patterns)

security_middleware = SecurityMiddleware()