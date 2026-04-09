from django.urls import re_path
from cms import views

app_name = "cms"

urlpatterns = [
    re_path(r'^$', views.home, name='home'),
    re_path(r'^(?P<permalink>.+)$', views.home, name='home'),
]