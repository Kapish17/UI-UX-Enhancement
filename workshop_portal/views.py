# Django Imports
from django.shortcuts import redirect
from django.urls import reverse
from django.conf import settings
from django.contrib.auth.decorators import login_required

# Local Imports
from cms.models import Page


def index(request):

    # If user is logged in → go to statistics dashboard
    if request.user.is_authenticated:
        return redirect(reverse("statistics_app:public"))

    # Otherwise follow default CMS behaviour
    page = Page.objects.filter(title=settings.HOME_PAGE_TITLE)

    if page.exists():
        redirect_url = reverse("cms:home", args=[page.first().permalink])
    else:
        redirect_url = reverse("workshop:index")

    return redirect(redirect_url)