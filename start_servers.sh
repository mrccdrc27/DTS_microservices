#!/bin/bash

# # Start Django server
# echo "Starting Django..."
# cd user_service
# python manage.py runserver 3000
# cd -

# # Start React app
# echo "Starting React..."
# cd frontend
# npm run dev

# Start Django server in background
echo "Starting Django..."
cd user_service || exit 1
python manage.py runserver $DJANGO_PORT &
cd - || exit 1

# Start React app
echo "Starting React..."
cd frontend || exit 1
npm run dev