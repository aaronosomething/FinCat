from django.db import models
from django.core import validators as v
from user_app.models import App_user

class Investment(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    investment_name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    rate_of_return = models.DecimalField(max_digits=5, decimal_places=2)
    contribution = models.PositiveIntegerField()
    contribution_timeline_years = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.investment_name} - {self.value} - {self.rate_of_return}"