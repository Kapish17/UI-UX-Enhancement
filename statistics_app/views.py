# Python Imports
import datetime as dt
import pandas as pd
import json




# Django Imports
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponse

# Local Imports
from workshop_app.models import Workshop, states
from teams.models import Team
from .forms import FilterForm


def is_instructor(user):
    """Check if user belongs to instructor group"""
    return user.groups.filter(name="instructor").exists()


def workshop_public_stats(request):
    """
    Public statistics view for workshops
    Handles filtering, pagination and CSV download
    """

    user = request.user
    form = FilterForm()

    # Get filter parameters
    from_date = request.GET.get("from_date")
    to_date = request.GET.get("to_date")
    state = request.GET.get("state")
    workshoptype = request.GET.get("workshop_type")
    show_workshops = request.GET.get("show_workshops")
    sort = request.GET.get("sort")
    download = request.GET.get("download")

    # Apply filters
    if from_date and to_date:

        form = FilterForm(
            start=from_date,
            end=to_date,
            state=state,
            type=workshoptype,
            show_workshops=show_workshops,
            sort=sort,
        )

        workshops = Workshop.objects.filter(
            date__range=(from_date, to_date), status=1
        ).order_by(sort)

        if state:
            workshops = workshops.filter(
                coordinator__profile__state=state
            )

        if workshoptype:
            workshops = workshops.filter(
                workshop_type_id=workshoptype
            )

    else:
        today = timezone.now()
        upto = today + dt.timedelta(days=15)

        workshops = Workshop.objects.filter(
            date__range=(today, upto),
            status=1
        ).order_by("date")

    # Show workshops belonging to logged-in user
    if show_workshops:
        if is_instructor(user):
            workshops = workshops.filter(instructor_id=user.id)
        else:
            workshops = workshops.filter(coordinator_id=user.id)

    # CSV download
    if download:

        data = workshops.values(
            "workshop_type__name",
            "coordinator__first_name",
            "coordinator__last_name",
            "instructor__first_name",
            "instructor__last_name",
            "coordinator__profile__state",
            "date",
            "status",
        )

        df = pd.DataFrame(list(data))

        if not df.empty:

            df.status.replace(
                [0, 1, 2],
                ["Pending", "Success", "Reject"],
                inplace=True,
            )

            codes, states_map = list(zip(*states))

            df.coordinator__profile__state.replace(
                codes, states_map, inplace=True
            )

            response = HttpResponse(content_type="text/csv")
            response[
                "Content-Disposition"
            ] = "attachment; filename=statistics.csv"

            df.to_csv(response, index=False)

            return response

        else:
            messages.warning(request, "No data found")

 # Chart data
    from django.db.models import Count

    # State statistics
    state_data = Workshop.objects.values(
        'coordinator__profile__state'
    ).annotate(count=Count('id'))

    ws_states = [i['coordinator__profile__state'] for i in state_data]
    ws_count = [i['count'] for i in state_data]

    # Workshop type statistics
    type_data = Workshop.objects.values(
        'workshop_type__name'
    ).annotate(count=Count('id'))

    ws_type = [i['workshop_type__name'] for i in type_data]
    ws_type_count = [i['count'] for i in type_data]

    total_workshops = Workshop.objects.count()
    total_states = len(ws_states)
    total_types = len(ws_type)

    # Trend data (REAL DATA)
    trend_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    trend_data = [
        Workshop.objects.filter(date__month=1).count(),
        Workshop.objects.filter(date__month=2).count(),
        Workshop.objects.filter(date__month=3).count(),
        Workshop.objects.filter(date__month=4).count(),
        Workshop.objects.filter(date__month=5).count(),
        Workshop.objects.filter(date__month=6).count(),
    ]

    # Pagination
    paginator = Paginator(workshops, 30)
    page = request.GET.get("page")
    workshops = paginator.get_page(page)

    # Context Data
    context = {
        "form": form,
        "objects": workshops,

        "total_workshops": total_workshops,
        "total_states": total_states,
        "total_types": total_types,

        "ws_states": json.dumps(ws_states),
        "ws_count": json.dumps(ws_count),
        "ws_type": json.dumps(ws_type),
        "ws_type_count": json.dumps(ws_type_count),

        "trend_labels": json.dumps(trend_labels),
        "trend_data": json.dumps(trend_data),
    }

    return render(
        request,
        "statistics_app/workshop_public_stats.html",
        context,
    )

@login_required
def team_stats(request, team_id=None):
    """
    Displays statistics of workshops taken by team members
    """

    user = request.user
    teams = Team.objects.all()

    team = teams.get(id=team_id) if team_id else teams.first()

    # Check if user belongs to the team
    if not team.members.filter(user_id=user.id).exists():
        messages.info(request, "You are not added to the team")
        return redirect(reverse("workshop:index"))

    member_workshop_data = {}

    for member in team.members.all():
        workshop_count = Workshop.objects.filter(
            instructor_id=member.user.id
        ).count()

        member_workshop_data[
            member.user.get_full_name()
        ] = workshop_count

    team_labels = list(member_workshop_data.keys())
    ws_count = list(member_workshop_data.values())

    return render(
        request,
        "statistics_app/team_stats.html",
        {
            "team_labels": team_labels,
            "ws_count": ws_count,
            "all_teams": teams,
            "team_id": team.id,
        },
    )