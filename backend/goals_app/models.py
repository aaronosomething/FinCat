from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core import validators as v
from user_app.models import App_user

class Goal(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    goal_name = models.CharField(max_length=120)
    is_favorite = models.BooleanField(default=False)
    is_complete = models.BooleanField(default=False)
    is_long_term = models.BooleanField(default=False)
# Create your models here.
