terraform {
  required_version = ">=1.4.6"

  required_providers {
    google = {
      source = "hashicorp/google"
      version = "~> 5.2.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "gcs" {}
}

provider "google" {
  project = var.project
  region = var.region
}

provider "kubernetes" {
  host = var.kubernetes_host
  token = var.kubernetes_token
}

resource "google_storage_bucket" "database_backups" {
  name = "${var.openshift_nameplate}-${var.openshift_environment}-obps-postgres-backups"
  location = var.region

  public_access_prevention = "enforced"

}

resource "google_service_account" "backups_sa" {
  account_id = "${var.openshift_nameplate}-${var.openshift_environment}-obps-backups-sa"
  display_name = "${var.openshift_nameplate}-${var.openshift_environment}-obps-backups-sa"
  depends_on = [ google_storage_bucket.database_backups ]
}

resource "google_storage_bucket_iam_binding" "database_binding" {
  bucket = google_storage_bucket.database_backups.name
  role = "roles/storage.admin"
  members = [
    "projectEditor:ggl-cas-storage",
    "projectOwner:ggl-cas-storage",
    "serviceAccount:${google_service_account.backups_sa.email}",
  ]
  depends_on = [ google_service_account.backups_sa ]
}

resource "google_service_account_key" "backups_sa_key" {
  service_account_id = google_service_account.backups_sa.name
}

resource "kubernetes_secret" "storage_secret" {
  metadata {
    name = "gcp-${google_service_account.backups_sa.display_name}-key"
    namespace = "${var.openshift_nameplate}-${var.openshift_environment}"
    labels = {
      created-by = "Terraform"
    }
  }

  data = {
    "bucket_name" = google_storage_bucket.database_backups.name
    "credentials.json" = base64decode(google_service_account_key.backups_sa_key.private_key)
  }
}

## ---------------------------------------------------------------------------------------------------------------------
## STORAGE FOR ATTACHMENTS
## Provisions storage buckets and service accounts for the buckets, then loads the secrets for the service accounts
## into an OpenShift secret.
## ---------------------------------------------------------------------------------------------------------------------

resource "google_storage_bucket" "reg_attachments" {
  name = "${var.openshift_nameplate}-${var.openshift_environment}-reg-attachments"
  location = var.region

  public_access_prevention = "enforced"

}

resource "google_service_account" "reg_attachments_sa" {
  account_id = "${var.openshift_nameplate}-${var.openshift_environment}-reg-attachments-sa"
  display_name = "${var.openshift_nameplate}-${var.openshift_environment}-reg-attachments-sa"
  depends_on = [ google_storage_bucket.reg_attachments ]
}

resource "google_storage_bucket_iam_binding" "reg_attachments_binding" {
  bucket = google_storage_bucket.reg_attachments.name
  role = "roles/storage.admin"
  members = [
    "projectEditor:ggl-cas-storage",
    "projectOwner:ggl-cas-storage",
    "serviceAccount:${google_service_account.reg_attachments_sa.email}",
  ]
  depends_on = [ google_service_account.reg_attachments_sa ]
}

resource "google_service_account_key" "reg_attachments_key" {
  service_account_id = google_service_account.reg_attachments_sa.name
}

resource "kubernetes_secret" "reg_attachments_storage_secret" {
  metadata {
    name = "gcp-${google_service_account.reg_attachments_sa.display_name}-key"
    namespace = "${var.openshift_nameplate}-${var.openshift_environment}"
    labels = {
      created-by = "Terraform"
    }
  }

  data = {
    "bucket_name" = google_storage_bucket.reg_attachments.name
    "credentials.json" = base64decode(google_service_account_key.reg_attachments_key.private_key)
  }
}
