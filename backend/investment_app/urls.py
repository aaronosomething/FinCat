from django.urls import path
from .views import InvestmentListCreate, InvestmentDetail, InvestmentSum

urlpatterns = [
    path('', InvestmentListCreate.as_view(), name='investment_list_create'),
    path('<int:pk>/', InvestmentDetail.as_view(), name='investment_detail'),
    path('sum/', InvestmentSum.as_view(), name='investment_sum'),
]
