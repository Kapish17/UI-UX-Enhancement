from string import punctuation, digits
from django import forms
from django.utils import timezone

from .models import (
    Profile, Workshop, Comment, department_choices,
    title, source, states, WorkshopType, AttachmentFile
)

try:
    from string import letters
except ImportError:
    from string import ascii_letters as letters

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .send_mails import generate_activation_key

UNAME_CHARS = letters + "._" + digits
PWD_CHARS = letters + punctuation + digits


class UserRegistrationForm(forms.Form):
    """User Registration Form"""

    required_css_class = 'required'
    errorlist_css_class = 'errorlist'

    username = forms.CharField(
        max_length=32,
        help_text="Letters, digits, period and underscore only.",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Username'
        })
    )

    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Email'
        })
    )

    password = forms.CharField(
        max_length=32,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Password'
        })
    )

    confirm_password = forms.CharField(
        max_length=32,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm Password'
        })
    )

    title = forms.ChoiceField(
        choices=title,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    first_name = forms.CharField(
        max_length=32,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    last_name = forms.CharField(
        max_length=32,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    phone_number = forms.RegexField(
        regex=r'^\d{10}$',
        error_messages={'invalid': "Phone number must be 10 digits."},
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    institute = forms.CharField(
        max_length=128,
        help_text="Please write full name of your Institute/Organization",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    department = forms.ChoiceField(
        help_text="Department you work/study",
        choices=department_choices,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    location = forms.CharField(
        max_length=255,
        help_text="Place/City",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    state = forms.ChoiceField(
        choices=[('', 'Select State')] + list(states),
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    how_did_you_hear_about_us = forms.ChoiceField(
        choices=source,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    # ---------- VALIDATIONS ----------

    def clean_username(self):
        username = self.cleaned_data["username"].lower()

        if username.strip(UNAME_CHARS):
            raise forms.ValidationError(
                "Only letters, digits, period and underscore are allowed."
            )

        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError(
                "Username already exists. Please choose another."
            )

        return username

    def clean_password(self):
        pwd = self.cleaned_data["password"]

        if pwd.strip(PWD_CHARS):
            raise forms.ValidationError(
                "Only letters, digits and punctuation are allowed in password."
            )

        return pwd

    def clean_confirm_password(self):
        confirm_pwd = self.cleaned_data["confirm_password"]
        pwd = self.cleaned_data.get("password")

        if pwd and confirm_pwd != pwd:
            raise forms.ValidationError("Passwords do not match")

        return confirm_pwd

    def clean_email(self):
        email = self.cleaned_data["email"]

        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(
                "This email is already registered."
            )

        return email

    # ---------- SAVE USER ----------

    def save(self):

        username = self.cleaned_data["username"].lower()
        password = self.cleaned_data["password"]
        email = self.cleaned_data["email"]

        new_user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        new_user.first_name = self.cleaned_data["first_name"]
        new_user.last_name = self.cleaned_data["last_name"]
        new_user.save()

        cleaned_data = self.cleaned_data

        profile, created = Profile.objects.get_or_create(user=new_user)

        profile.institute = cleaned_data["institute"]
        profile.department = cleaned_data["department"]
        profile.phone_number = cleaned_data["phone_number"]
        profile.location = cleaned_data["location"]
        profile.title = cleaned_data["title"]
        profile.state = cleaned_data["state"]
        profile.how_did_you_hear_about_us = cleaned_data["how_did_you_hear_about_us"]

        profile.activation_key = generate_activation_key(new_user.username)
        profile.key_expiry_time = timezone.now() + timezone.timedelta(days=1)

        profile.save()

        return username, password, profile.activation_key


# ---------- LOGIN FORM ----------

class UserLoginForm(forms.Form):

    username = forms.CharField(
        max_length=32,
        widget=forms.TextInput(
            attrs={'class': 'form-control', 'placeholder': 'Username'}
        )
    )

    password = forms.CharField(
        max_length=32,
        widget=forms.PasswordInput(
            attrs={'class': 'form-control', 'placeholder': 'Password'}
        )
    )

    def clean(self):

        cleaned_data = super().clean()

        username = cleaned_data.get("username")
        password = cleaned_data.get("password")

        if not username or not password:
            raise forms.ValidationError(
                "Username and password are required."
            )

        user = authenticate(username=username, password=password)

        if not user:
            raise forms.ValidationError(
                "Invalid username or password."
            )

        return user


# ---------- WORKSHOP FORM ----------

class WorkshopForm(forms.ModelForm):

    errorlist_css_class = 'errorlist'

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super().__init__(*args, **kwargs)

        # Dropdown default option
        self.fields['workshop_type'].empty_label = "Select Workshop Type"

        # Remove checkbox label text
        self.fields['tnc_accepted'].label = ""
        self.fields['tnc_accepted'].required = True

        # Custom labels
        self.fields['workshop_type'].label = "Workshop Type"
        self.fields['date'].label = "Workshop Date"

        # Accept both formats if user enters manually
        self.fields['date'].input_formats = ["%Y-%m-%d", "%d-%m-%Y"]

    class Meta:
        model = Workshop
        exclude = ['status', 'instructor', 'coordinator']

        widgets = {

            'date': forms.DateInput(
    format="%d-%m-%Y",
    attrs={
        'type': 'text',
        'class': 'form-control flatpickr',
        'placeholder': 'DD-MM-YYYY',
        'autocomplete': 'off'
    }
),

            'workshop_type': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),

            'tnc_accepted': forms.CheckboxInput(
                attrs={
                    'class': 'form-check-input'
                }
            )
        }


# ---------- COMMENTS FORM ----------

class CommentsForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super().__init__(*args, **kwargs)

        self.fields['comment'].required = True
        self.fields['public'].label = "Public"

    class Meta:
        model = Comment
        exclude = ['author', 'created_date', 'workshop']

        widgets = {
            'comment': forms.Textarea(
                attrs={'class': 'form-control'}
            ),
            'public': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}
            )
        }


# ---------- WORKSHOP TYPE FORM ----------

class WorkshopTypeForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field in self.visible_fields():
            field.field.widget.attrs['class'] = 'form-control'
            field.field.widget.attrs['placeholder'] = field.label

    class Meta:
        model = WorkshopType
        exclude = []


# ---------- ATTACHMENT FORM ----------

class AttachmentFileForm(forms.ModelForm):

    class Meta:
        model = AttachmentFile
        exclude = ['workshop_type']


# ---------- PROFILE FORM ----------

class ProfileForm(forms.ModelForm):

    class Meta:
        model = Profile
        exclude = [
            "user",
            "is_email_verified",
            "activation_key",
            "key_expiry_time",
            "how_did_you_hear_about_us"
        ]

    first_name = forms.CharField(
        max_length=30,
        widget=forms.TextInput(
            {'class': "form-control", 'placeholder': "First Name"}
        )
    )

    last_name = forms.CharField(
        max_length=30,
        widget=forms.TextInput(
            {'class': "form-control", 'placeholder': "Last Name"}
        )
    )

    def __init__(self, *args, **kwargs):

        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        if user:
            self.fields['first_name'].initial = user.first_name
            self.fields['last_name'].initial = user.last_name

        self.fields['institute'].widget.attrs.update(
            {'class': "form-control", 'placeholder': 'Institute'}
        )

        self.fields['department'].widget.attrs.update(
            {'class': "custom-select"}
        )

        self.fields['title'].widget.attrs.update(
            {'class': "custom-select"}
        )

        self.fields['state'].widget.attrs.update(
            {'class': "custom-select"}
        )

        self.fields['phone_number'].widget.attrs.update(
            {'class': "form-control", 'placeholder': 'Phone Number'}
        )

        self.fields['position'].widget.attrs.update(
            {'class': "form-control", 'placeholder': 'Position'}
        )

        self.fields['location'].widget.attrs.update(
            {'class': "form-control", 'placeholder': 'Location'}
        )


class AddWorkshopForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Change default dropdown label
        self.fields['workshop_type'].empty_label = "Select Workshop Type"

    class Meta:
        model = Workshop
        fields = ["workshop_type", "date", "tnc_accepted"]

        widgets = {
            "date": forms.DateInput(
    format="%d-%m-%Y",
    attrs={
        "class": "form-control datepicker",
        "placeholder": "Select Workshop Date (DD-MM-YYYY)",
        "autocomplete": "off"
    }
),
            "workshop_type": forms.Select(
                attrs={"class": "form-control"}
            ),
            "tnc_accepted": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            )
        }