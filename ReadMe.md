# To Run:
1. Install Dependencies: 
for python: `pip install -r requirements.txt`
for frontend: `cd frontend`, `npm install`
2. Run the server:
in powershell: `bash ./start_servers.sh`
or
in git bash: `./start_servers.sh`

git rm -r --cached <folder>


seed: python manage.py seed_tickets --force


dependencies:
httpx
redis
faker

docker run -d --name redis -p 6379:6379 redis
