variable "project" {
  description = "The project ID where resources will be launched"
  type = string
}

variable "region" {
  description = "The location of the resources"
  type = string
  default = "NORTHAMERICA-NORTHEAST1"
}

variable "openshift_nameplate" {
  description = "The nameplate of the OpenShift namespace"
  type = string
}

variable "openshift_environment" {
  description = "The environment of the OpenShift namepsace (dev, test, prod)"
}
