import redis
import json

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

def publish_ticket_created(ticket_id):
    payload = {'ticket_id': ticket_id}
    redis_client.publish('ticket.created', json.dumps(payload))
