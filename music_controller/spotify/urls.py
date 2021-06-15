from django.urls import path
from .views import CurrentSong, SpotifyAuthUrl, SpotifyCallback, IsAuthenticated, GetTokens

urlpatterns = [
    path('get-auth-url', SpotifyAuthUrl.as_view()),
    path('callback', SpotifyCallback.as_view()),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('get-tokens', GetTokens.as_view()),
    path('current-song', CurrentSong.as_view())
]