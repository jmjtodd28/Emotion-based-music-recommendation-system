from django.urls import path, include
from .views import main
from .views import PreferenceDataView
from .views import GetCurrentEmotion


urlpatterns = [
    path('', main),
    path('set-preferences', PreferenceDataView.as_view()),
    path('get-emotion', GetCurrentEmotion.as_view())
]