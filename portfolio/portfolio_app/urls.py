from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('portfolio_details/',views.portfolio_details, name='portfolio_details'),
    path('services_details/',views.services_details, name='services_details'),
    path('submit/', views.submit_form, name='submit_form')
]
