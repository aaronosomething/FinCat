from django.urls import path
from .views import ( RetirementPlanView, RetirementIncomeListCreate, IncomeDelete, RetirementIncomeBulkImport, InflationData)

urlpatterns = [
    path('', RetirementPlanView.as_view(), name='retire-plan-view'),
    path('income/', RetirementIncomeListCreate.as_view(), name = 'retire-list-create'),
    path('income/<int:pk>/', IncomeDelete.as_view(), name='income-delete'),
    path('income/bulk/', RetirementIncomeBulkImport.as_view(), name='income-bulk-import'),
    path('inflation/', InflationData.as_view(), name='get-inflation'),
]