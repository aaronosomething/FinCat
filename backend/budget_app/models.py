from django.db import models
from django.core import validators as v
from user_app.models import App_user


class Income(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - ${self.amount}"


class Expense(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - ${self.amount}"


class Deduction(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - ${self.amount}"


class CostOfLiving(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    col_zip = models.PositiveIntegerField(
        validators=[
            v.MinValueValidator(0),
            v.MaxValueValidator(99999)
        ]
    )

    def __str__(self):
        return f"COL for {self.col_zip}"
