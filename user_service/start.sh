#!/bin/sh

# Apply migrations
python manage.py migrate

# Start Gunicorn server
gunicorn user_service.wsgi:application --bind 0.0.0.0:$PORT
