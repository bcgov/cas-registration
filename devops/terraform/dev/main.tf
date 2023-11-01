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
