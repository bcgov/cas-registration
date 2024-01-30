variable "project" {
  description = "The project ID where resources will be launched"
  type = string
}

variable "region" {
  description = "The location of the resources"
  type = string
  default = "NORTHAMERICA-NORTHEAST1"
}

variable "openshift_namespace" {
  description = "The namespace of the OpenShift cluster"
  type = string
}

variable "kubernetes_host" {
  description = "The hostname of the Openshift cluster"
}

variable "kubernetes_token" {
  description = "The authentication token for the Openshift cluster"
}
