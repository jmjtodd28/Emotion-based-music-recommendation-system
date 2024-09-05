from django.db import models

class Token(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    access_token = models.CharField(max_length=150)
    refresh_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)