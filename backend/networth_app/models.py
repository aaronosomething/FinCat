from django.db import models
from django.core import validators as v
from user_app.models import App_user

class Asset(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.name} - ${self.amount}"


class Liability(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.name} - ${self.amount}"