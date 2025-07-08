# Pulumi Azure Managed Application (AKS + CSI + Helm)

This project provisions an advanced Azure infrastructure using Pulumi in TypeScript. It includes an Azure Kubernetes Service (AKS) cluster, integrated Key Vault access via CSI driver, and deployment of a sample application using Helm.

---

## Features

- Azure Key Vault integration using CSI driver
- Secrets mounted as files into AKS pods
- Helm deployment of NGINX sample app
- Ingress-ready structure with TLS support (from Key Vault certificates)
- GitHub Actions CI/CD workflow for automated deployment
- Multi-environment setup: `dev`, `staging`, `prod`

---



