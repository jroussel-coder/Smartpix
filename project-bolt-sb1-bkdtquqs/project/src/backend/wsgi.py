# backend/wsgi.py
"""
WSGI entry point for production deployment
Use with gunicorn: gunicorn --bind 0.0.0.0:5000 wsgi:app
"""

import os
from app import app
from config import config

# Get configuration from environment
config_name = os.getenv('FLASK_ENV', 'production')
app.config.from_object(config[config_name])

if __name__ == "__main__":
    app.run()