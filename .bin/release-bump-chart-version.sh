#!/usr/bin/env bash

set -euxo pipefail

VERSION=$1

sed -i '' "s/^appVersion:.*/appVersion: \"${VERSION}\"/" helm/cas-bciers/Chart.yaml
git add helm/cas-bciers/Chart.yaml
