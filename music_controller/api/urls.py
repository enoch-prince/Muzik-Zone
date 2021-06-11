from django.urls import path
from .views import AllCustomViewClasses, GetApiEndpoints, GetUserRoomCode

with open('backend_endpoints.txt', 'r') as file:
    endpoints = [endpoint.strip() for endpoint in file.readlines()]
    if not endpoints:
        raise Exception(f'The file {file.name} is empty. It should contain at least one endpoint!')

urlpatterns = [
    path(endpoint, AllCustomViewClasses[endpoint[:-len('-room')]].as_view()) for endpoint in endpoints
]

urlpatterns.append(path('endpoints', GetApiEndpoints.as_view()))
urlpatterns.append(path('current-room-code', GetUserRoomCode.as_view()))