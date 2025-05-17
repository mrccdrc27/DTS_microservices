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

# Start JSON Server
echo "Starting JSON server..."
cd frontend/public
npx json-server --watch db.json --port 5000 &
cd ../..

# Start user_service
echo "Starting user_service..."
cd user_service
python manage.py runserver 0.0.0.0:3000 &
cd ..

# Start workflow_service
echo "Starting workflow_service..."
cd workflow_service
python manage.py runserver 0.0.0.0:2000 &
cd ..

# Start React app
echo "Starting React app..."
cd frontend
setup_env
npm install
npm run dev &

cd ..
echo "Starting workflow_service..."
