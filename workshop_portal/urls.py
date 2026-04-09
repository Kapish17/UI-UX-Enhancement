"""workshop_portal URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from workshop_portal import views


urlpatterns = [

    # Admin
    path('admin/', admin.site.urls),

    # Home page
    path('', views.index, name='home'),

    # Workshop app
    path('workshop/', include('workshop_app.urls')),

    # Password reset / auth
    path('reset/', include('django.contrib.auth.urls')),

    # CMS pages
    path('page/', include('cms.urls')),

    # Statistics app
    path('statistics/', include('statistics_app.urls')),

]

# Media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)