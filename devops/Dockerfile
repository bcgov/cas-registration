FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:450.0.0-alpine
RUN gcloud components install core gsutil
RUN apk --update add terraform

COPY ./scripts/create-state-bucket.sh /bucket.sh
COPY ./terraform/ /terraform/
