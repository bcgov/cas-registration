{{/*
Expand the name of the chart.
*/}}
{{- define "cas-bciers.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "cas-bciers.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cas-bciers.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Gets the prefix of the namespace. (<openshift_nameplate>, ... )
*/}}
{{- define "cas-bciers.namespacePrefix" }}
{{- (split "-" .Release.Namespace)._0 | trim -}}
{{- end }}

{{/*
Gets the suffix of the namespace. (-dev, -tools, ... )
*/}}
{{- define "cas-bciers.namespaceSuffix" }}
{{- (split "-" .Release.Namespace)._1 | trim -}}
{{- end }}

{{/*
Create an app-name appended with environment. (app-name-dev, app-name-tools, ... )
*/}}
{{- define "cas-bciers.nameWithEnvironment" }}
{{- printf "%s-%s" .Chart.Name  (split "-" .Release.Namespace)._1 }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cas-bciers.labels" -}}
helm.sh/chart: {{ include "cas-bciers.chart" . }}
{{ include "cas-bciers.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cas-bciers.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cas-bciers.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "cas-bciers.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "cas-bciers.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}


{{/*
Define environment variables for the application.
*/}}
{{- define "cas-bciers.backendEnvVars" -}}
- name: DJANGO_SECRET_KEY
  valueFrom:
    secretKeyRef:
      key: django-secret-key
      name: {{ include "cas-bciers.fullname" . }}-backend
- name: CHES_CLIENT_SECRET
  valueFrom:
    secretKeyRef:
      key: clientSecret
      name: ches-integration
- name: CHES_CLIENT_ID
  valueFrom:
    secretKeyRef:
      key: clientId
      name: ches-integration
- name: CHES_TOKEN_ENDPOINT
  valueFrom:
    secretKeyRef:
      key: tokenEndpoint
      name: ches-integration
- name: CHES_API_URL
  valueFrom:
    secretKeyRef:
      key: apiUrl
      name: ches-integration
- name: DB_USER
  valueFrom:
    secretKeyRef:
      key: user
      name: cas-obps-postgres-pguser-registration
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      key: password
      name: cas-obps-postgres-pguser-registration
- name: DB_NAME
  valueFrom:
    secretKeyRef:
      key: dbname
      name: cas-obps-postgres-pguser-registration
- name: DB_PORT
  valueFrom:
    secretKeyRef:
      key: pgbouncer-port
      name: cas-obps-postgres-pguser-registration
- name: DB_HOST
  valueFrom:
    secretKeyRef:
      key: pgbouncer-host
      name: cas-obps-postgres-pguser-registration
- name: ALLOWED_HOSTS
  value: '*'
- name: BACKEND_HOST
  value: {{ .Values.backend.route.host }}
- name: DJANGO_SUPERUSER_USERNAME
  valueFrom:
    secretKeyRef:
      key: username
      name: django-superuser
- name: DJANGO_SUPERUSER_PASSWORD
  valueFrom:
    secretKeyRef:
      key: password
      name: django-superuser
- name: GS_BUCKET_NAME
  valueFrom:
    secretKeyRef:
      key: bucket_name
      name: gcp-{{ .Release.Namespace }}-bciers-attach-service-account-key
- name: GOOGLE_APPLICATION_CREDENTIALS
  value: "/attachment-credentials/attachment-credentials.json"
- name: ENVIRONMENT
  value: {{ .Values.backend.environment }}
{{- end }}
