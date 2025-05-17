#!/bin/bash
# Start Json Database
echo "Starting json server..."
cd frontend/public
npx json-server --watch db.json --port 5000 &
cd ../..

# Start Django server
echo "Starting user_service..."
cd user_service
python manage.py runserver &
cd ..

# Start Django server
echo "Starting workflow_service..."
cd workflow_service
python manage.py runserver &
cd ..

# Start React app
echo "Starting React..."
cd frontend
npm install #install packages
npm run dev
cd ..