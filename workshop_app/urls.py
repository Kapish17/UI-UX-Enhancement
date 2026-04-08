"""workshop_portal URL Configuration"""

from django.urls import re_path
from workshop_app import views

app_name = "workshop"

urlpatterns = [

    # Home
    re_path(r'^$', views.index, name='index'),

    # Authentication
    re_path(r'^register/$', views.user_register, name="register"),
    re_path(r'^login/$', views.user_login, name="login"),
    re_path(r'^logout/$', views.user_logout, name="logout"),

    # Dashboard pages
    re_path(
        r'^status$',
        views.workshop_status_coordinator,
        name='workshop_status_coordinator'
    ),

    re_path(
        r'^dashboard$',
        views.workshop_status_instructor,
        name='workshop_status_instructor'
    ),

    # Workshop actions
    re_path(
        r'^accept_workshop/(?P<workshop_id>\d+)',
        views.accept_workshop,
        name='accept_workshop'
    ),

    re_path(
        r'^change_workshop_date/(?P<workshop_id>\d+)$',
        views.change_workshop_date,
        name='change_workshop_date'
    ),

    re_path(
        r'^propose/$',
        views.propose_workshop,
        name='propose_workshop'
    ),

    # Workshop types
    re_path(
        r'^types/$',
        views.workshop_type_list,
        name='workshop_type_list'
    ),

    # Profile
    re_path(
        r'^view_profile/$',
        views.view_own_profile,
        name='view_own_profile'
    ),
]