# Django imports
from django import forms

# Local Imports
from workshop_app.models import states, WorkshopType


class FilterForm(forms.Form):

    from_date = forms.DateField(
        required=False,
        input_formats=["%d-%m-%Y"],
        widget=forms.DateInput(
            format="%d-%m-%Y",
            attrs={
                'type': 'text',
                'class': 'form-control flatpickr',
                'placeholder': 'DD-MM-YYYY',
                'autocomplete': 'off'
            }
        )
    )

    to_date = forms.DateField(
        required=False,
        input_formats=["%d-%m-%Y"],
        widget=forms.DateInput(
            format="%d-%m-%Y",
            attrs={
                'type': 'text',
                'class': 'form-control flatpickr',
                'placeholder': 'DD-MM-YYYY',
                'autocomplete': 'off'
            }
        )
    )

    workshop_type = forms.ChoiceField(
        choices=[('', 'Select Workshop')],
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    state = forms.ChoiceField(
        choices=[('', 'Select State')] + list(states),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    show_workshops = forms.BooleanField(
        help_text="Show my workshops only",
        required=False
    )

    sort = forms.ChoiceField(
        choices=(("date", "Oldest"), ("-date", "Latest")),
        help_text="Sort by",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    def __init__(self, *args, **kwargs):

        start = kwargs.pop("start", None)
        end = kwargs.pop("end", None)
        selected_state = kwargs.pop("state", None)
        selected_type = kwargs.pop("type", None)
        show_workshops = kwargs.pop("show_workshops", None)
        sort = kwargs.pop("sort", None)

        super(FilterForm, self).__init__(*args, **kwargs)

        # Load workshop choices dynamically
        self.fields["workshop_type"].choices = [
            ('', 'Select Workshop')
        ] + [(w.id, w.name) for w in WorkshopType.objects.all()]

        # Set initial values
        self.fields["from_date"].initial = start
        self.fields["to_date"].initial = end
        self.fields["state"].initial = selected_state
        self.fields["workshop_type"].initial = selected_type
        self.fields["show_workshops"].initial = show_workshops
        self.fields["sort"].initial = sort