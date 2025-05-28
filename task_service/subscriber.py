import redis, json, httpx, asyncio

REDIS = redis.StrictRedis(host='localhost', port=6379, db=0)
GATEWAY_URL = 'http://localhost:8001/api'  # your gateway endpoint

async def handle_ticket_created(ticket_id):
    async with httpx.AsyncClient() as client:
        r = await client.get(f'{GATEWAY_URL}/tickets/{ticket_id}/')
        print(f'{GATEWAY_URL}/tickets/{ticket_id}/')
        if r.status_code == 200:
            ticket = r.json()
            print("🤖 Processing ticket:", ticket)
            # …do your task-service work here…
        else:
            print(f"⚠️ Failed to fetch ticket {ticket_id}: {r.status_code}")

def main():
    pubsub = REDIS.pubsub()
    pubsub.subscribe('ticket.created')
    print("🔄 Listening for ticket.created events…")

    for msg in pubsub.listen():
        if msg['type'] != 'message':
            continue
        data = json.loads(msg['data'])
        ticket_id = data.get('ticket_id')
        if ticket_id:
            # schedule async fetch+process
            asyncio.run(handle_ticket_created(ticket_id))

if __name__ == '__main__':
    main()
