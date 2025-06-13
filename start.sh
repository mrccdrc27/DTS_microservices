#!/bin/bash

set -e # Exit on any error

# Function to copy .env if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        cp .env.example .env
        echo ".env created from .env.example"
    else
        echo ".env already exists, skipping copy."
    fi
}
setup_env
cd workflow_api
# disable when seeding workflows as the workflow seed has its own role generation
celery -A workflow_api worker --pool=solo --loglevel=info -Q role_send & 
# Start Celery worker in background
celery -A workflow_api worker --pool=solo --loglevel=info -Q ticket_tasks &
cd ..

# Start user_service
echo "Starting user_service..."
cd user_service
python manage.py migrate
python manage.py runserver 0.0.0.0:3000 &
cd ..




echo "Celery worker for workflow_api started in background."

# Start workflow_api
echo "Starting workflow_api..."
cd workflow_api
python manage.py makemigrations --no-input
python manage.py migrate

# Start Django server for workflow_api
python manage.py runserver 0.0.0.0:2000 &
cd ..

# Start ticket_service
echo "Starting ticket_service..."
cd ticket_service
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000 &
cd ..

# Optionally start task_service
# echo "Starting task_service..."
# cd task_service
# python manage.py flush --no-input
# python manage.py migrate
# python manage.py runserver 0.0.0.0:4000 &
# cd ..

echo "All services started."
