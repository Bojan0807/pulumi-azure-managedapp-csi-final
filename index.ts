import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import * as k8s from "@pulumi/kubernetes";
import * as k8s_helm from "@pulumi/kubernetes/helm/v3";

// Create Resource Group
const config = new pulumi.Config("azure-native");
const location = config.require("location");
const rgName = config.require("resourceGroupName");

const resourceGroup = new azure.resources.ResourceGroup("aks-rg", {
  location,
  resourceGroupName: rgName,
});

// Create AKS Cluster
const aksCluster = new azure.containerservice.ManagedCluster("aks", {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  dnsPrefix: "pulumi-aks",
  identity: { type: "SystemAssigned" },
  agentPoolProfiles: [{
    count: 2,
    maxPods: 110,
    mode: "System",
    name: "agentpool",
    osType: "Linux",
    type: "VirtualMachineScaleSets",
    vmSize: "Standard_DS2_v2",
  }],
  enableRBAC: true,
});

// Get credentials
const creds = pulumi.all([resourceGroup.name, aksCluster.name]).apply(([rg, name]) =>
  azure.containerservice.listManagedClusterUserCredentials({ resourceGroupName: rg, resourceName: name })
);

// Kubeconfig
const kubeconfig = creds.kubeconfigs[0].value.apply(enc => Buffer.from(enc, "base64").toString());

// K8s Provider
const k8sProvider = new k8s.Provider("k8s-provider", { kubeconfig });

// Install CSI driver with Helm
const csiHelm = new k8s_helm.Chart("csi-secrets-store", {
  chart: "csi-secrets-store-provider-azure",
  version: "1.4.0",
  fetchOpts: {
    repo: "https://azure.github.io/secrets-store-csi-driver-provider-azure/charts",
  },
}, { provider: k8sProvider });

// Deploy sample Helm app (nginx)
const nginx = new k8s_helm.Chart("nginx-app", {
  chart: "nginx",
  version: "15.2.0",
  fetchOpts: {
    repo: "https://charts.bitnami.com/bitnami",
  },
  values: {
    service: { type: "LoadBalancer" }
  }
}, { provider: k8sProvider });

export const kubeconfigOut = kubeconfig;
export const clusterName = aksCluster.name;