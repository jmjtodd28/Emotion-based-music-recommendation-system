from django.urls import path
from .views import AuthURL, SpotifyCallback, GetToken, DeleteToken, refresh_token

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('callback', SpotifyCallback),
    path('token', GetToken.as_view()),
    path('logout', DeleteToken.as_view()),
    path('refresh-token', refresh_token ) 
]