from api.models import Room
from .models import SpotifyToken, SpotifyTokenSerializer

from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAdminUser
from requests import Request, post, put, get
from datetime import timedelta

class SpotifyAuthUrl(APIView):
    auth_uri = "https://accounts.spotify.com/authorize"

    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modifiy-playback-state user-read-currently-playing user-library-read user-top-read user-read-recently-played'
        
        url = Request("GET", self.auth_uri, params={
            "scopes": scopes,
            "response_type": "code",
            "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
            "client_id": settings.SPOTIFY_CLIENT_ID
        }).prepare().url

        return Response({"url": url}, status=status.HTTP_200_OK)

class SpotifyCallback(APIView):
    token_uri = "https://accounts.spotify.com/api/token"

    # GET request that creates or updates user's tokens
    def get(self, request, format=None):
        code = request.GET.get('code')
        error = request.GET.get('error')

        if error:
            return Response({"error": error}, status=status.HTTP_401_UNAUTHORIZED)

        # send a post request to the token_uri and receive tokens as response
        response = post(self.token_uri, data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "client_secret": settings.SPOTIFY_CLIENT_SECRET
        }).json()

        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()

        self.update_or_create_tokens(self.request.session.session_key, response)
        return redirect("frontend:")

    @staticmethod # needs to be reuseable
    def get_user_tokens(user_session_key):
        token_obj = SpotifyToken.objects.filter(user=user_session_key)

        if not token_obj.exists():
            return None
        return token_obj[0]
    
    @classmethod # depends on get_user_tokens(session_key) and has to be reuseable
    def update_or_create_tokens(cls, user_session_key, response):
        access_token = response.get("access_token")
        refresh_token = response.get("refresh_token")
        token_type = response.get("token_type")
        expires_in = timezone.now() + timedelta(seconds=response.get("expires_in"))

        tokens = cls.get_user_tokens(user_session_key)

        if not tokens:
            # create new tokens
            print("Creating tokens...")
            tokens = SpotifyToken(
                user=user_session_key, access_token=access_token, 
                refresh_token=refresh_token, expires_in=expires_in
            )
            tokens.save()
        else:
            # update existing tokens
            print("Updating tokens...")
            tokens.access_token = access_token
            tokens.refresh_token = refresh_token
            tokens.token_type = token_type
            tokens.expires_in = expires_in
            tokens.save(
                update_fields=["access_token", "refresh_token", 
                "token_type", "expires_in"]
            )

class IsAuthenticated(SpotifyCallback):

    # request that refreshes expired tokens and check for authentication
    def get(self, request, format=None):
        authenticated = True

        # return not authenticated if user session does not exist
        if not self.request.session.exists(request.session.session_key):
            return Response({"status": not authenticated}, status=status.HTTP_200_OK)
        #print({"user": self.request.session.session_key})
        tokens = self.get_user_tokens(self.request.session.session_key)
        #print({"tokens": tokens})
        if not tokens:
            return Response({"status": not authenticated}, status=status.HTTP_200_OK)
        
        if tokens.expires_in <= timezone.now():
            self.refresh_spotify_tokens(tokens)

        return Response({"status": authenticated}, status=status.HTTP_200_OK)

    def refresh_spotify_tokens(self, tokens):
        # user session key must exist for this function to work
        refresh_token = tokens.refresh_token

        response = post(self.token_uri, data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "client_secret": settings.SPOTIFY_CLIENT_SECRET
        }).json()

        self.update_or_create_tokens(self.request.session.session_key, response)

class GetTokens(generics.ListAPIView):
    queryset = SpotifyToken.objects.all()
    serializer_class = SpotifyTokenSerializer
    #permission_classes = [IsAdminUser]

class APICall:
    BASE_URL = "https://api.spotify.com/v1/me/"

    @classmethod
    def execute_spotify_api_request(cls, host, endpoint, _post=False, _put=False):
        """Default api call is a get request"""

        token = SpotifyCallback.get_user_tokens(host)
        
        headers = {"Content-type": "application/json", "Authorization": "Bearer " + token.access_token}
        
        if _post:
            post(cls.BASE_URL + endpoint, headers=headers)
        
        if _put:
            put(cls.BASE_URL + endpoint, headers=headers)
        
        response = get(cls.BASE_URL + endpoint, {}, headers=headers)
        try:
            return response.json()
        except:
            return {"Error": "Issue with request"}

class CurrentSong(APIView):
    endpoint = "player/currently-playing"
    
    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room  = Room.objects.filter(code=room_code)
        
        if not room.exists():
            return Response({"msg": "Not Found!"}, status=status.HTTP_404_NOT_FOUND)
        
        room = room.first()
        host = room.host
        response = APICall.execute_spotify_api_request(host, self.endpoint)

        return Response(response, status=status.HTTP_200_OK)
