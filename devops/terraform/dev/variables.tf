variable "project" {
  description = "The project ID where resources will be launched"
  type = string
}

variable "region" {
  description = "The location of the resources"
  type = string
  default = "NORTHAMERICA-NORTHEAST1"
}
