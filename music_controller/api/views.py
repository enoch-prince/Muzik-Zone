from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwargs = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwargs)
        if not code:
            return Response({'Bad Request!': 'Room code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)
        
        room = Room.objects.filter(code=code)
        if not room:
            return Response({'Not Found!': f'Room with code {code} does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        data = RoomSerializer(room[0]).data
        data['is_host'] = self.request.session.session_key == room[0].host
        return Response(data, status=status.HTTP_200_OK)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    #CRUD Implementation
    def post(self, request, format=None):

        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            votes_to_skip = serializer.data.get('votes_to_skip')
            guest_can_pause = serializer.data.get('guest_can_pause')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)

            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session["room_code"] = room.code
                return Response(data=RoomSerializer(room).data, status=status.HTTP_202_ACCEPTED)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session["room_code"] = room.code
                return Response(data=RoomSerializer(room).data, status=status.HTTP_201_CREATED)

class JoinRoom(APIView):
    lookup_url_kwargs = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        
        code = request.data.get(self.lookup_url_kwargs)
        if not code:
            return Response({"Bad request":"request didn't contain room code"}, status=status.HTTP_400_BAD_REQUEST)
        
        room = Room.objects.filter(code=code)
        if not room:
            return Response({"Not Found":f"Can't join room that doesn't exist, room code: {code}"}, status=status.HTTP_404_NOT_FOUND)
        
        self.request.session["room_code"] = code
        return Response({"message": f"Successfully joined room {code}"}, status=status.HTTP_200_OK)
        
class LeaveRoom(APIView):

    def post(self, request, format=None):

        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room = Room.objects.filter(host=host_id)

            if room:
                room[0].delete()
        
        return Response({'message': 'Success'}, status=status.HTTP_200_OK)

# This holds all the custom views created to automate the creation of urls paths
# It must correlate with the endpoints in the "backend_endpoints.txt" file
# Restart the server when you edit the "backend_endpoints.txt" file
AllCustomViewClasses = {
    'view': RoomView,
    'get': GetRoom,
    'create': CreateRoomView,
    'join': JoinRoom,
    'leave': LeaveRoom
}


############## Internally called by the Frontend ###########
class GetApiEndpoints(APIView):

    def get(self, request, format=None):
        from .urls import endpoints
        return Response(endpoints, status=status.HTTP_200_OK)

class GetUserRoomCode(APIView):

    def get(self, request, format=None):

        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        return Response({'code': self.request.session.get('room_code')},status=status.HTTP_200_OK)
##############################################################
