#!/bin/bash
# Start Json Database
echo "Starting json server..."
cd frontend/public
npx json-server --watch db.json --port 5000 &
cd ../..

# Start Django server
echo "Starting Django..."
cd user_service
python manage.py runserver &
cd ..

# Start React app
echo "Starting React..."
cd frontend
npm install #install packages
npm run dev
cd ..