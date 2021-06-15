from django.db import models
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers

class SpotifyToken(models.Model):
    user = models.CharField(_("User session key"), max_length=100, unique=True)
    token_type = models.CharField(_("Token Type"), max_length=50)
    access_token = models.CharField(_("Access Token"), max_length=500)
    refresh_token = models.CharField(_("Refresh Token"), max_length=550)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    expires_in = models.DateTimeField(_("Expires In"))

class SpotifyTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpotifyToken
        fields = '__all__'