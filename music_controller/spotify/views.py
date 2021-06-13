from ..music_controller.settings import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from requests import post, Request

class SpotifyAuthUrl(APIView):
    auth_uri = "https://accounts.spotify.com/authorize"
    def get(self, request, format=None):
        scopes = "user-read-playback-state user-modifiy-playback-state user-read-currently-playing user-library-read user-top-read" 
        
        url = Request("GET", self.auth_uri, params={
            "scopes": scopes,
            "response_typ": "code",
            "redirect_uri": SPOTIFY_CLIENT_SECRET,
            "client_id": SPOTIFY_CLIENT_ID
        }).prepare().url

        return Response({"url": url}, status=status.HTTP_200_OK)