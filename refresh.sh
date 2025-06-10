set -e 
cd workflow_api
python manage.py flush --no-input &
python manage.py makemigrations &
python manage.py migrate &
python manage.py seed_workflows