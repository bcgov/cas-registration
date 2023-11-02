terraform {
  required_version = ">=1.5.3"

  required_providers {
    google = {
      source = "hashicorp/google"
      version = "~> 5.2.0"
    }
  }
}

provider "google" {
  project = var.project
  region = var.region
}

resource "google_storage_bucket" "database_backups" {
  name = "${var.openshift_nameplate}-${var.openshift_environment}-obps-postgres-backups"
  location = var.region

  public_access_prevention = "enforced"

}

resource "google_service_account" "account" {
  account_id = "${var.openshift_nameplate}-${var.openshift_environment}-backups-sa"
  display_name = "${var.openshift_nameplate}-${var.openshift_environment}-backups-sa"
  depends_on = [ google_storage_bucket.database_backups ]
}

resource "google_storage_bucket_iam_binding" "database_binding" {
  bucket = google_storage_bucket.database_backups.name
  role = "roles/storage.admin"
  members = [
    "projectEditor:ggl-cas-storage",
    "projectOwner:ggl-cas-storage",
    "serviceAccount:${google_service_account.account.email}",
  ]
  depends_on = [ google_service_account.account ]
}
