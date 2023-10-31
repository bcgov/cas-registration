FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:450.0.0-alpine
RUN gcloud components install core gsutil

COPY ./../scripts/create-state-buckets.sh /buckets.sh
