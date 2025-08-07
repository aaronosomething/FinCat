from django.urls import path
from .views import All_goals, A_goal, Fav_goals, Comp_goals

urlpatterns = [
    path("", All_goals.as_view(), name='all_goals'),
    path("goal/", A_goal.as_view(), name='add_goal'),
    path("goal/<int:goal_id>/", A_goal.as_view(), name='delete_goal'),
    path("favorites/", Fav_goals.as_view(), name='fav_goals'),
    path('favorites/<int:goal_id>/', Fav_goals.as_view(), name='toggle_favorite'),
    path('complted/', Comp_goals.as_view(), name='comp_goals'),
    path('completed/<int:goal_id>/', Comp_goals.as_view(), name='toggle_complete'),
]