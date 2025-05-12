#!/bin/bash

# Start Django server
echo "Starting Django..."
cd user_service
python manage.py runserver &
cd ..

# Start React app
echo "Starting React..."
cd frontend
npm run dev
