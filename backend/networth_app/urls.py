from django.urls import path
from .views import ( AssetListCreate, AssetDelete, LiabilityListCreate, LiabilityDelete )

urlpatterns = [
    #Assets
    path('asset/', AssetListCreate.as_view(), name='asset-list-create'),
    path('asset/<int:pk>/', AssetDelete.as_view(), name='asset-delete'),

    #Liabilities
    path('liability/', LiabilityListCreate.as_view(), name='liability-list-create'),
    path('liability/<int:pk>/', LiabilityDelete.as_view(), name='liability-delete'),
]