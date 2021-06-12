from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = tuple('id code host guest_can_pause votes_to_skip created_at'.split())

class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')

class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[]) #needed since the 'code' field is a unique field in the models

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')