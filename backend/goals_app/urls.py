from django.urls import path
from .views import All_goals, Fav_goals

urlpatterns = [
    path("", All_goals.as_view()),
    path("/favs", Fav_goals.as_view()),
]