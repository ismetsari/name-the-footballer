variable "minikube_version" {
  description = "The version of Minikube to install."
  type        = string
  default     = "latest"
}

variable "kubernetes_version" {
  description = "The version of Kubernetes to use with Minikube."
  type        = string
  default     = "v1.21.0"
} 