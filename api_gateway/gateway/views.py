import httpx, json
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

TICKET_SERVICE_URL = 'http://localhost:8001'  # ticket service base

@method_decorator(csrf_exempt, name='dispatch')
class TicketListView(View):
    async def get(self, request):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f'{TICKET_SERVICE_URL}/tickets/')
            return JsonResponse(resp.json(), safe=False, status=resp.status_code)
    async def post(self, request):
        data = json.loads(request.body or '{}')
        async with httpx.AsyncClient() as client:
            resp = await client.post(f'{TICKET_SERVICE_URL}/tickets/', json=data)
            return JsonResponse(resp.json(), status=resp.status_code)

@method_decorator(csrf_exempt, name='dispatch')
class TicketDetailView(View):
    async def get(self, request, ticket_id):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f'{TICKET_SERVICE_URL}/tickets/{ticket_id}/')
            return JsonResponse(resp.json(), status=resp.status_code)
    async def put(self, request, ticket_id):
        data = json.loads(request.body or '{}')
        async with httpx.AsyncClient() as client:
            resp = await client.put(f'{TICKET_SERVICE_URL}/tickets/{ticket_id}/', json=data)
            return JsonResponse(resp.json(), status=resp.status_code)
    async def delete(self, request, ticket_id):
        async with httpx.AsyncClient() as client:
            resp = await client.delete(f'{TICKET_SERVICE_URL}/tickets/{ticket_id}/')
            return HttpResponse(status=resp.status_code)
