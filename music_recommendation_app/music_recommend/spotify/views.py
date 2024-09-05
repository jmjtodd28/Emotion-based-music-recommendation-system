from django.shortcuts import redirect
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status, generics
from rest_framework.response import Response
from .models import Token
from .serializer import TokenSerializer
from django.utils import timezone
from django.http import JsonResponse

# This will return a url which will be used to redirect the user to the spotify login page, 
# the user will then be returned to the redirect uri /spotify/callback
class AuthURL(APIView):
    def get(self, request, fornat=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private user-read-private streaming user-read-email user-read-private playlist-modify-public playlist-modify-private'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'show_dialog': True
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

#After the user signs in to spotify they are taken to /spotify/callback with a code in the url which we will use to get tokens which we will save in the database, 
# we will finally redirect users to the home page
def SpotifyCallback(request):
    code = request.GET.get('code', None)

    # user doesnt accept auth
    if not code:
        return redirect('http://127.0.0.1:8000')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response['access_token']
    refresh_token = response['refresh_token']
    token_type = response['token_type']
    expires_in = response['expires_in']

    expires_in = timezone.now() + timezone.timedelta(seconds=expires_in)

    #Remove all existing tokens from the database so we have no old ones
    Token.objects.all().delete()

    token_instance = Token.objects.create(
        access_token = access_token,
        refresh_token = refresh_token,
        token_type = token_type,
        expires_in = expires_in
    )

    return redirect('http://127.0.0.1:8000/')

# Allow user to access token to make api calls
class GetToken(generics.ListAPIView):
    queryset = Token.objects.all()
    serializer_class = TokenSerializer

#When a user logsout, the token is deleted and user will have to auth again
class DeleteToken(APIView):
    def get(self, request, format=None):
        Token.objects.all().delete()

        return Response({'message': 'Logout sucessful' }, status=status.HTTP_200_OK)

#The frontend checks to see if the token has expired and if it has then this endpoint will return a refreshed token
def refresh_token(reqeust):

    #This does not change after access_token is refreshed
    refresh_token = Token.objects.first().refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response['access_token']
    token_type = response['token_type']
    expires_in = response['expires_in']

    expires_in = timezone.now() + timezone.timedelta(seconds=expires_in)

    #Remove all existing tokens from the database so we have no old ones
    Token.objects.all().delete()

    token_instance = Token.objects.create(
        access_token = access_token,
        refresh_token = refresh_token,
        token_type = token_type,
        expires_in = expires_in
    )

    serializer = TokenSerializer(Token.objects.first())
    serialized_data = serializer.data
        
    return JsonResponse(serialized_data)