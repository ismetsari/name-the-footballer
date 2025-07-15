provider "local" {
  # Configuration options
}

provider "null" {
  # Configuration options
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "null_resource" "minikube_start" {
  provisioner "local-exec" {
    command = "minikube start --driver=docker --memory=4096 --cpus=3"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "minikube stop"
  }
}

resource "null_resource" "minikube_stop" {
  provisioner "local-exec" {
    command = "minikube stop"
  }
} 