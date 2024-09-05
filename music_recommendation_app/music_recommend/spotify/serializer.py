from rest_framework import serializers
from .models import Token

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ('id', 'created_at', 'access_token', 'refresh_token', 'expires_in', 'token_type')