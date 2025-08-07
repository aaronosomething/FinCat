from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core import validators as v
# Create your models here.

class App_user(AbstractUser):
    email = models.EmailField(unique=True)
    # age = models.PositiveIntegerField(default=18, validators = [v.MinValueValidator(18), v.MaxValueValidator(100)])
    # display_name = models.CharField(default='unknown' , max_length=50)
    # address = models.TextField(default='unknown')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS =[]
    # lists
