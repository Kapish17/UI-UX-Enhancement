from django.contrib import messages
from django.db.models import Q
from django.forms import inlineformset_factory, model_to_dict
from django.http import JsonResponse, Http404
from django.urls import reverse

try:
    from StringIO import StringIO as string_io
except ImportError:
    from io import BytesIO as string_io

from datetime import datetime
import os

from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.shortcuts import render, redirect
from django.utils import timezone

from .forms import (
    UserRegistrationForm, UserLoginForm,
    ProfileForm, WorkshopForm, CommentsForm, WorkshopTypeForm
)

from .models import (
    Profile, User,
    Workshop, Comment,
    WorkshopType, AttachmentFile
)

from .send_mails import send_email


# --------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------

def is_email_checked(user):
    # Email verification disabled
    return True


def is_instructor(user):
    return user.groups.filter(name='instructor').exists()


def get_landing_page(user):
    if is_instructor(user):
        return reverse('workshop:workshop_status_instructor')
    return reverse('workshop:workshop_status_coordinator')


# --------------------------------------------------
# INDEX
# --------------------------------------------------

def index(request):
    user = request.user

    if user.is_authenticated:
        return redirect(get_landing_page(user))

    return redirect(reverse('workshop:login'))


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

def user_login(request):

    user = request.user

    if user.is_superuser:
        return redirect('/admin')

    if user.is_authenticated:
        return redirect(get_landing_page(user))

    if request.method == "POST":

        form = UserLoginForm(request.POST)

        if form.is_valid():

            user = form.cleaned_data
            login(request, user)

            return redirect(get_landing_page(user))

        else:
            return render(request, 'workshop_app/login.html', {"form": form})

    else:

        form = UserLoginForm()

        return render(request, 'workshop_app/login.html', {"form": form})


# --------------------------------------------------
# LOGOUT
# --------------------------------------------------

def user_logout(request):

    logout(request)

    return render(request, 'workshop_app/logout.html')


# --------------------------------------------------
# REGISTER
# --------------------------------------------------

def user_register(request):

    if request.method == 'POST':

        form = UserRegistrationForm(request.POST)

        if form.is_valid():

            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')

            if User.objects.filter(username=username).exists():
                messages.error(request, "Username already exists.")
                return render(request, "workshop_app/register.html", {"form": form})

            if User.objects.filter(email=email).exists():
                messages.error(request, "Email already registered.")
                return render(request, "workshop_app/register.html", {"form": form})

            username, password, key = form.save()

            user = User.objects.get(username=username)
            profile = Profile.objects.get(user=user)

            # Mark email verified automatically
            profile.is_email_verified = True
            profile.save()

            login(request, user)

            return redirect(get_landing_page(user))

        else:

            messages.error(request, "Registration failed.")

            return render(request, "workshop_app/register.html", {"form": form})

    else:

        if request.user.is_authenticated:
            return redirect(get_landing_page(request.user))

        form = UserRegistrationForm()

    return render(request, "workshop_app/register.html", {"form": form})


# --------------------------------------------------
# WORKSHOP STATUS (COORDINATOR)
# --------------------------------------------------

@login_required
def workshop_status_coordinator(request):

    user = request.user

    if is_instructor(user):
        return redirect(get_landing_page(user))

    workshops = Workshop.objects.filter(
        coordinator=user.id
    ).order_by('-date')

    return render(
        request,
        'workshop_app/workshop_status_coordinator.html',
        {"workshops": workshops}
    )


# --------------------------------------------------
# WORKSHOP STATUS (INSTRUCTOR)
# --------------------------------------------------

@login_required
def workshop_status_instructor(request):

    user = request.user

    if not is_instructor(user):
        return redirect(get_landing_page(user))

    today = timezone.now().date()

    workshops = Workshop.objects.filter(
        Q(instructor=user.id, date__gte=today) | Q(status=0)
    ).order_by('-date')

    return render(
        request,
        'workshop_app/workshop_status_instructor.html',
        {"workshops": workshops, "today": today}
    )


# --------------------------------------------------
# ACCEPT WORKSHOP
# --------------------------------------------------

@login_required
def accept_workshop(request, workshop_id):

    user = request.user

    if not is_instructor(user):
        return redirect(get_landing_page(user))

    workshop = Workshop.objects.get(id=workshop_id)

    workshop.status = 1
    workshop.instructor = user
    workshop.save()

    messages.success(request, "Workshop accepted!")

    return redirect(reverse('workshop:workshop_status_instructor'))


# --------------------------------------------------
# CHANGE WORKSHOP DATE
# --------------------------------------------------

@login_required
def change_workshop_date(request, workshop_id):

    user = request.user

    if not is_instructor(user):
        return redirect(get_landing_page(user))

    if request.method == 'POST':

        new_workshop_date = datetime.strptime(
            request.POST.get('new_date'), "%Y-%m-%d"
        )

        workshop = Workshop.objects.filter(id=workshop_id)
        workshop.update(date=new_workshop_date)

        messages.info(request, "Workshop date updated")

    return redirect(reverse('workshop:workshop_status_instructor'))


# --------------------------------------------------
# PROPOSE WORKSHOP
# --------------------------------------------------

@login_required
def propose_workshop(request):

    user = request.user

    if is_instructor(user):
        return redirect(get_landing_page(user))

    form = WorkshopForm()

    if request.method == 'POST':

        form = WorkshopForm(request.POST)

        if form.is_valid():

            form_data = form.save(commit=False)
            form_data.coordinator = user
            form_data.save()

            messages.success(request, "Workshop proposed successfully")

            return redirect(get_landing_page(user))

    return render(request, 'workshop_app/propose_workshop.html', {"form": form})


# --------------------------------------------------
# WORKSHOP TYPE LIST
# --------------------------------------------------

def workshop_type_list(request):

    workshop_types = WorkshopType.objects.get_queryset().order_by("id")

    paginator = Paginator(workshop_types, 12)

    page = request.GET.get('page')

    workshop_type = paginator.get_page(page)

    return render(
        request,
        'workshop_app/workshop_type_list.html',
        {'workshop_type': workshop_type}
    )


# --------------------------------------------------
# VIEW OWN PROFILE
# --------------------------------------------------

@login_required
def view_own_profile(request):

    user = request.user
    profile = user.profile

    if request.method == 'POST':

        form = ProfileForm(request.POST, user=user, instance=profile)

        if form.is_valid():

            form_data = form.save(commit=False)

            form_data.user = user
            form_data.user.first_name = request.POST['first_name']
            form_data.user.last_name = request.POST['last_name']

            form_data.user.save()
            form_data.save()

            messages.success(request, "Profile updated.")

            return redirect(reverse("workshop:view_own_profile"))

    else:

        form = ProfileForm(user=user, instance=profile)

    return render(
        request,
        "workshop_app/view_profile.html",
        {"profile": profile, "Workshops": None, "form": form}
    )