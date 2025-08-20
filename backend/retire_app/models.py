from django.db import models
from django.core import validators as v
from user_app.models import App_user


class RetirementPlan(models.Model):
    user = models.OneToOneField(App_user, on_delete=models.CASCADE)
    current_age = models.PositiveIntegerField()
    retirement_age = models.PositiveIntegerField()
    projected_expenses = models.DecimalField(max_digits=10, decimal_places=2)
    withdrawal_rate = models.DecimalField(max_digits=5, decimal_places=2)
    readiness = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.current_age} - {self.retirement_age} - {self.projected_expenses} - {self.withdrawal_rate}"

class RetirementIncomeSource(models.Model):
    user = models.ForeignKey(App_user, on_delete=models.CASCADE)
    income_source = models.CharField(max_length=100)
    age_available = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "income_source"], name="unique_user_income_source")
        ]

    def __str__(self):
        return f"{self.income_source} - {self.age_available} - {self.amount}"


