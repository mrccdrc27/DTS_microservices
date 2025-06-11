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

# Start workflow_api
echo "Starting workflow_api..."
cd workflow_api
python manage.py migrate
python manage.py flush --no-input
python manage.py seed_workflows
python manage.py runserver 0.0.0.0:2000 &
cd ..

# Start user_service
echo "Starting user_service..."
cd user_service
python manage.py migrate
python manage.py runserver 0.0.0.0:3000 &
cd ..

# Start task_service
echo "Starting task_service..."
cd task_service
python manage.py migrate
python manage.py runserver 0.0.0.0:4000 &
cd ..

# Start ticket_service
echo "Starting ticket_service..."
cd ticket_service
python manage.py flush --no-input
python manage.py makemigrations
python manage.py migrate
python manage.py seed_tickets
python manage.py runserver 0.0.0.0:8000 &
cd ..

cd ..
echo "Starting workflow_service..."
