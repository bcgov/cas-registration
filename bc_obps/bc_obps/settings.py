"""
Django settings for bc_obps project.

Generated by 'django-admin startproject' using Django 4.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os
from google.oauth2 import service_account
from pathlib import Path
import dj_database_url
import urllib.parse

from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG")
ENVIRONMENT = os.environ.get("ENVIRONMENT")
BYPASS_ROLE_ASSIGNMENT = os.environ.get("BYPASS_ROLE_ASSIGNMENT", False) == "True"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost").split(",")

CHES_CLIENT_ID = os.environ.get("CHES_CLIENT_ID")
CHES_CLIENT_SECRET = os.environ.get("CHES_CLIENT_SECRET")
CHES_TOKEN_ENDPOINT = os.environ.get("CHES_TOKEN_ENDPOINT")
CHES_API_URL = os.environ.get("CHES_API_URL")

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'simple_history',
    "corsheaders",
    "localflavor",
    "registration.apps.RegistrationConfig",
    "reporting.apps.ReportingConfig",
]


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "registration.middleware.kubernetes_middleware.KubernetesHealthCheckMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "registration.middleware.current_user_middleware.CurrentUserMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    'simple_history.middleware.HistoryRequestMiddleware',
]

if DEBUG:  # DEV only apps
    INSTALLED_APPS.append("django_extensions")
    # SILK
    INSTALLED_APPS.append("silk")
    MIDDLEWARE.insert(0, "silk.middleware.SilkyMiddleware")
    SILKY_PYTHON_PROFILER = True

ROOT_URLCONF = "bc_obps.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "bc_obps.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
default_db_url = f"postgres://{os.environ.get('DB_USER', 'postgres')}:{urllib.parse.quote(str(os.environ.get('DB_PASSWORD')))}@{os.environ.get('DB_HOST', '127.0.0.1')}:{os.environ.get('DB_PORT', '5432')}/{os.environ.get('DB_NAME', 'registration')}"
DATABASES = {'default': dj_database_url.config(default=default_db_url, conn_max_age=600, conn_health_checks=True)}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = os.environ.get("STATIC_URL", "/static/")
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Google Cloud Storage Settings
STORAGES = {
    "default": {"BACKEND": "storages.backends.gcloud.GoogleCloudStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
GS_BUCKET_NAME = os.environ.get("GS_BUCKET_NAME")
if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    GS_CREDENTIALS = service_account.Credentials.from_service_account_file(
        os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    )
GS_FILE_OVERWRITE = False
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]

DATA_UPLOAD_MAX_MEMORY_SIZE = 20000000

# Sentry Exception Tracking
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

# Only enable sentry in production
SENTRY_ENVIRONMENT = os.environ.get('SENTRY_ENVIRONMENT')
SENTRY_TRACE_SAMPLE_RATE = os.environ.get('SENTRY_TRACE_SAMPLE_RATE')
if SENTRY_ENVIRONMENT == 'prod' and DEBUG == 'False':
    sentry_sdk.init(
        dsn="https://c097ce7d51760bab348fa0608eea9870@o646776.ingest.sentry.io/4506621387407360",
        integrations=[DjangoIntegration()],
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=float(SENTRY_TRACE_SAMPLE_RATE) if SENTRY_TRACE_SAMPLE_RATE is not None else 0,
        # Specify environment (usually production or staging)
        environment='production',
    )
