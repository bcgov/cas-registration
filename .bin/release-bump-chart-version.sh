#!/usr/bin/env bash

set -euxo pipefail

VERSION=$1

# Bump app versions in charts for BCIERS
sed -i '' "s/^appVersion:.*/appVersion: \"${VERSION}\"/" helm/cas-bciers/Chart.yaml
sed -i '' "s/^appVersion:.*/appVersion: \"${VERSION}\"/" helm/migration-test/cas-obps-backend-migration-test/Chart.yaml

# Bump chart version in test chart
CURRENT_TEST_CHART_VERSION=$(grep -Po '(?<=^version: )[^ "]+' helm/migration-test/cas-obps-backend-migration-test/Chart.yaml)
MAJOR_MINOR_TEST_CHART_VERSION=${echo "$CURRENT_TEST_CHART_VERSION" | grep -Po '.*(?=\.\d+)'}
PATCH_TEST_CHART_VERSION=${echo "$CURRENT_TEST_CHART_VERSION" | grep -Po '\d+$'}
NEW_TEST_CHART_VERSION="${MAJOR_MINOR_TEST_CHART_VERSION}.$((PATCH_TEST_CHART_VERSION + 1))"

sed -i '' "s/^version:.*/version: ${NEW_TEST_CHART_VERSION}/" helm/migration-test/cas-obps-backend-migration-test/Chart.yaml

# Commit changes
git add helm/cas-bciers/Chart.yaml
git add helm/migration-test/cas-obps-backend-migration-test/Chart.yaml
