from django.urls import path
from .views import SpotifyAuthUrl

urlpatterns = [
    path('get-auth-url', SpotifyAuthUrl.as_view())
]