import os
import uuid
import pandas as pd

from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator


position_choices = (
    ("coordinator", "Coordinator"),
    ("instructor", "Instructor")
)

department_choices = (
    ("computer engineering", "Computer Science"),
    ("information technology", "Information Technology"),
    ("civil engineering", "Civil Engineering"),
    ("electrical engineering", "Electrical Engineering"),
    ("mechanical engineering", "Mechanical Engineering"),
    ("chemical engineering", "Chemical Engineering"),
    ("aerospace engineering", "Aerospace Engineering"),
    ("biosciences and bioengineering", "Biosciences and BioEngineering"),
    ("electronics", "Electronics"),
    ("energy science and engineering", "Energy Science and Engineering"),
)

title = (
    ("Professor", "Prof."),
    ("Doctor", "Dr."),
    ("Shriman", "Shri"),
    ("Shrimati", "Smt"),
    ("Kumari", "Ku"),
    ("Mr", "Mr."),
    ("Mrs", "Mrs."),
    ("Miss", "Ms."),
)

source = (
    ("FOSSEE website", "FOSSEE website"),
    ("Google", "Google"),
    ("Social Media", "Social Media"),
    ("From other College", "From other College"),
)

states = (
    ("", "---------"),
    ("IN-AP", "Andhra Pradesh"),
    ("IN-AR", "Arunachal Pradesh"),
    ("IN-AS", "Assam"),
    ("IN-BR", "Bihar"),
    ("IN-CT", "Chhattisgarh"),
    ("IN-GA", "Goa"),
    ("IN-GJ", "Gujarat"),
    ("IN-HR", "Haryana"),
    ("IN-HP", "Himachal Pradesh"),
    ("IN-JK", "Jammu and Kashmir"),
    ("IN-JH", "Jharkhand"),
    ("IN-KA", "Karnataka"),
    ("IN-KL", "Kerala"),
    ("IN-MP", "Madhya Pradesh"),
    ("IN-MH", "Maharashtra"),
    ("IN-MN", "Manipur"),
    ("IN-ML", "Meghalaya"),
    ("IN-MZ", "Mizoram"),
    ("IN-NL", "Nagaland"),
    ("IN-OR", "Odisha"),
    ("IN-PB", "Punjab"),
    ("IN-RJ", "Rajasthan"),
    ("IN-SK", "Sikkim"),
    ("IN-TN", "Tamil Nadu"),
    ("IN-TG", "Telangana"),
    ("IN-TR", "Tripura"),
    ("IN-UT", "Uttarakhand"),
    ("IN-UP", "Uttar Pradesh"),
    ("IN-WB", "West Bengal"),
    ("IN-AN", "Andaman and Nicobar Islands"),
    ("IN-CH", "Chandigarh"),
    ("IN-DN", "Dadra and Nagar Haveli"),
    ("IN-DD", "Daman and Diu"),
    ("IN-DL", "Delhi"),
    ("IN-LD", "Lakshadweep"),
    ("IN-PY", "Puducherry")
)


def has_profile(user):
    return hasattr(user, 'profile')


def attachments(instance, filename):
    return os.sep.join((instance.workshop_type.name.replace(" ", '_'), filename))


class Profile(models.Model):
    """Profile for users (instructors and coordinators)"""

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=32, blank=True, choices=title)

    institute = models.CharField(max_length=150)

    department = models.CharField(max_length=150, choices=department_choices)

    phone_number = models.CharField(
        max_length=10,
        validators=[RegexValidator(
            regex=r'^.{10}$',
            message="Phone number must be entered in the format: '9999999999'. Up to 10 digits allowed."
        )]
    )

    position = models.CharField(
        max_length=32,
        choices=position_choices,
        default='coordinator',
        help_text='Select Coordinator if you want to organise a workshop in your college/school. Select Instructor if you want to conduct a workshop.'
    )

    how_did_you_hear_about_us = models.CharField(
        max_length=255, blank=True, choices=source
    )

    location = models.CharField(
        max_length=255, blank=True, help_text="Place/City"
    )

    state = models.CharField(max_length=255, choices=states, default="IN-MH")

    # ⭐ NEW FIELD (Profile Avatar)
    profile_image = models.ImageField(
        upload_to='profile_pics/',
        blank=True,
        null=True,
        default='profile_pics/default.png'
    )

    is_email_verified = models.BooleanField(default=False)

    activation_key = models.CharField(max_length=255, blank=True, null=True)

    key_expiry_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.get_full_name()}"


class WorkshopType(models.Model):

    name = models.CharField(max_length=120)

    description = models.TextField()

    duration = models.PositiveIntegerField(
        help_text='Please enter duration in days',
        validators=[MinValueValidator(1)]
    )

    terms_and_conditions = models.TextField()

    def __str__(self):
        return f"{self.name} for {self.duration} day(s)"


class AttachmentFile(models.Model):

    attachments = models.FileField(
        upload_to=attachments,
        help_text='Upload workshop documents like schedule or instructions.'
    )

    workshop_type = models.ForeignKey(WorkshopType, on_delete=models.CASCADE)


class WorkshopManager(models.Manager):

    def get_workshops_by_state(self, workshops):

        w = workshops.values_list("coordinator__profile__state", flat=True)

        states_map = dict(states)

        df = pd.DataFrame(list(w))

        data_states, data_counts = [], []

        if not df.empty:

            grouped_data = df.value_counts().to_dict()

            for state, count in grouped_data.items():

                state_name = state[0]

                data_states.append(states_map[state_name])

                data_counts.append(count)

        return data_states, data_counts


    def get_workshops_by_type(self, workshops):

        w = workshops.values_list("workshop_type__name", flat=True)

        df = pd.DataFrame(list(w))

        data_wstypes, data_counts = [], []

        if not df.empty:

            grouped_data = df.value_counts().to_dict()

            for ws, count in grouped_data.items():

                ws_name = ws[0]

                data_wstypes.append(ws_name)

                data_counts.append(count)

        return data_wstypes, data_counts


class Workshop(models.Model):

    uid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    coordinator = models.ForeignKey(User, on_delete=models.CASCADE)

    instructor = models.ForeignKey(
        User,
        null=True,
        related_name="%(app_label)s_%(class)s_related",
        on_delete=models.CASCADE
    )

    workshop_type = models.ForeignKey(
        WorkshopType,
        on_delete=models.CASCADE
    )

    date = models.DateField()

    STATUS_CHOICES = [
        (0, 'Pending'),
        (1, 'Accepted'),
        (2, 'Deleted')
    ]

    status = models.IntegerField(choices=STATUS_CHOICES, default=0)

    tnc_accepted = models.BooleanField()

    objects = WorkshopManager()

    def __str__(self):
        return f"{self.workshop_type} on {self.date} by {self.coordinator}"

    def get_status(self):
        choice = dict(self.STATUS_CHOICES)
        return choice.get(self.status)


class Testimonial(models.Model):

    name = models.CharField(max_length=150)

    institute = models.CharField(max_length=255)

    department = models.CharField(max_length=150)

    message = models.TextField()

    def __str__(self):
        return f"Testimonial by {self.name}"


class Comment(models.Model):

    author = models.ForeignKey(User, on_delete=models.CASCADE)

    comment = models.TextField()

    public = models.BooleanField(default=True)

    created_date = models.DateTimeField(default=timezone.now)

    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)

    def __str__(self):
        return f"Comment by {self.author.get_full_name()}"


class Banner(models.Model):

    title = models.CharField(max_length=500)

    html = models.TextField()

    active = models.BooleanField()

    def __str__(self):
        return self.title
    

from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a Profile whenever a new User is created.
    This prevents 'User has no profile' errors.
    """
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save the profile whenever the user is saved.
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()