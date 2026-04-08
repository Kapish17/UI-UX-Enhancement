__author__ = "Akshen Doke"

import hashlib
import logging
import logging.config
import os

import yaml
import re
from django.core.mail import send_mail
from textwrap import dedent
from random import randint
from smtplib import SMTP
from django.utils.crypto import get_random_string
from string import punctuation, digits
try:
	from string import letters
except ImportError:
	from string import ascii_letters as letters
from workshop_portal.settings import (
					EMAIL_HOST,
					EMAIL_PORT,
					EMAIL_HOST_USER,
					EMAIL_HOST_PASSWORD,
					EMAIL_USE_TLS,
					PRODUCTION_URL,
					SENDER_EMAIL,
					ADMIN_EMAIL
					)
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from os import listdir, path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from time import sleep
from .models import WorkshopType


def validateEmail(email):
	if len(email) > 7:
		if re.match("^.+\\@(\\[?)[a-zA-Z0-9\\-\\.]+\\.([a-zA-Z]{2,3}|[0-9]{1,3})(\\]?)$",
					email) != None:
			return 1
		return 0


def generate_activation_key(username):
	"""Generates hashed secret key for email activation"""
	chars = letters + digits + punctuation
	secret_key = get_random_string(randint(10,40), chars)
	return hashlib.sha256((secret_key + username).encode('utf-8')).hexdigest()


def send_smtp_email(request=None, subject=None, message=None,
				user_position=None, workshop_date=None,
				workshop_title=None, user_name=None,
				other_email=None, phone_number=None,
				institute=None, attachment=None):
	'''
		Send email using SMTPLIB
	'''

	msg = MIMEMultipart()
	msg['From'] = EMAIL_HOST_USER
	msg['To'] = other_email
	msg['Subject'] = subject
	body = message
	msg.attach(MIMEText(body, 'plain'))

	if attachment:
		from django.conf import settings
		from os import listdir, path
		files = listdir(settings.MEDIA_ROOT)
		for f in files:
			attachment = open(path.join(settings.MEDIA_ROOT,f), 'rb')
			part = MIMEBase('application', 'octet-stream')
			part.set_payload((attachment).read())
			encoders.encode_base64(part)
			part.add_header('Content-Disposition', "attachment; filename= %s " % f)
			msg.attach(part)


	server = SMTP(EMAIL_HOST, EMAIL_PORT)
	server.ehlo()
	server.starttls()
	server.ehlo()
	server.esmtp_features['auth']='LOGIN DIGEST-MD5 PLAIN'
	server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
	text = msg.as_string()
	server.sendmail(EMAIL_HOST_USER, other_email, text)
	server.close()


def send_email(request, call_on,
               user_position=None, workshop_date=None,
               new_workshop_date=None,
               workshop_title=None, user_name=None,
               other_email=None, phone_number=None,
               institute=None, key=None):
    '''
    Email sending function while registration and
    booking confirmation.
    '''

    try:
        with open(path.join(settings.LOG_FOLDER, 'emailconfig.yaml'), 'r') as configfile:
            config_dict = yaml.safe_load(configfile)
        logging.config.dictConfig(config_dict)
    except:
        print('File Not Found and Configuration Error')

    # -------- REGISTRATION -------- #

    if call_on == "Registration":

        message = dedent("""\
Thank you for registering as a coordinator with us.

Please click on the below link to activate your account:

{0}/workshop/activate_user/{1}

After activation you can proceed to book your dates for the workshop(s).

In case of queries regarding workshop booking(s), revert to this email.
""".format(PRODUCTION_URL, key))

        logging.info("New Registration from: %s", other_email)

        try:
            send_mail(
                "Coordinator Registration at FOSSEE, IIT Bombay",
                message,
                SENDER_EMAIL,
                [other_email],
                fail_silently=True
            )

        except Exception:
            send_smtp_email(
                request=request,
                subject="Coordinator Registration - FOSSEE, IIT Bombay",
                message=message,
                other_email=other_email
            )

    # -------- BOOKING -------- #

    elif call_on == "Booking":

        if user_position == "instructor":

            message = dedent("""\
Coordinator name:{0}
Coordinator email: {1}
Contact number:{2}
Institute:{3}
Workshop date:{4}
Workshop title:{5}

You may accept or reject this booking
{6}/workshop/dashboard
""".format(
                user_name,
                request.user.email,
                request.user.profile.phone_number,
                request.user.profile.institute,
                workshop_date,
                workshop_title,
                PRODUCTION_URL
            ))

            logging.info("Booking Done by %s for %s", request.user.email, other_email)

            try:
                send_mail(
                    "New FOSSEE Workshop booking on {0}".format(workshop_date),
                    message,
                    SENDER_EMAIL,
                    [other_email],
                    fail_silently=True
                )

            except Exception:
                send_smtp_email(
                    request=request,
                    subject="New FOSSEE Workshop booking on {0}".format(workshop_date),
                    message=message,
                    other_email=other_email
                )

        else:

            message = dedent("""\
Thank You for New FOSSEE Workshop booking.

Workshop date:{0}
Workshop title:{1}

Your request has been received and is awaiting instructor approval/disapproval.
""".format(workshop_date, workshop_title))

            try:
                send_mail(
                    "Pending Request for New FOSSEE Workshop booking on {0}".format(workshop_date),
                    message,
                    SENDER_EMAIL,
                    [request.user.email],
                    fail_silently=True
                )
            except Exception:
                send_smtp_email(
                    request=request,
                    subject="Pending Request for New FOSSEE Workshop booking on {0}".format(workshop_date),
                    message=message,
                    other_email=request.user.email
                )

    # -------- BOOKING CONFIRMED -------- #

    elif call_on == "Booking Confirmed":

        message = dedent("""\
Workshop confirmed.

Workshop date:{0}
Workshop title:{1}

This is an auto-generated mail.
""".format(workshop_date, workshop_title))

        send_mail(
            "FOSSEE Workshop booking confirmation",
            message,
            SENDER_EMAIL,
            [other_email],
            fail_silently=True
        )

    # -------- WORKSHOP DELETED -------- #

    elif call_on == "Workshop Deleted":

        message = dedent("""\
You have deleted a Workshop.

Workshop date:{0}
Workshop title:{1}

This is an auto-generated mail.
""".format(workshop_date, workshop_title))

        send_mail(
            "FOSSEE workshop deleted for {0}".format(workshop_date),
            message,
            SENDER_EMAIL,
            [request.user.email],
            fail_silently=True
        )

    # -------- CHANGE DATE -------- #

    elif call_on == "Change Date":

        message = dedent("""\
Dear User,

Workshop date has been changed from {0} to {1}

This is an auto-generated mail.
""".format(workshop_date, new_workshop_date))

        send_mail(
            "FOSSEE Python Workshop Date Changed",
            message,
            SENDER_EMAIL,
            [other_email],
            fail_silently=True
        )