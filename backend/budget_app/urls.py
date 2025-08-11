from django.urls import path
from .views import (
    IncomeListCreate, IncomeDelete,
    ExpenseListCreate, ExpenseDelete,
    DeductionListCreate, DeductionDelete,
    CostOfLivingListCreate
)

urlpatterns = [
    # Income
    path('income/', IncomeListCreate.as_view(), name='income-list-create'),
    path('income/<int:pk>/', IncomeDelete.as_view(), name='income-delete'),

    # Expenses
    path('expenses/', ExpenseListCreate.as_view(), name='expense-list-create'),
    path('expenses/<int:pk>/', ExpenseDelete.as_view(), name='expense-delete'),

    # Deductions
    path('deductions/', DeductionListCreate.as_view(), name='deduction-list-create'),
    path('deductions/<int:pk>/', DeductionDelete.as_view(), name='deduction-delete'),

    # Cost of Living
    path('col/', CostOfLivingListCreate.as_view(), name='col-list-create'),
]
