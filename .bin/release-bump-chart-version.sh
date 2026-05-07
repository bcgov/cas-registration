#!/usr/bin/env bash

set -euxo pipefail

VERSION=$1
BCIERS_CHART="helm/cas-bciers/Chart.yaml"
MIGRATION_TEST_CHART="helm/migration-test/cas-obps-backend-migration-test/Chart.yaml"

# Bump app versions in charts for BCIERS
sed -i '' "s/^appVersion:.*/appVersion: \"${VERSION}\"/" $BCIERS_CHART
sed -i '' "s/^appVersion:.*/appVersion: \"${VERSION}\"/" $MIGRATION_TEST_CHART

# Bump chart version in test chart
CURRENT_TEST_CHART_VERSION=$(grep -Po '(?<=^version: )[^ "]+' $MIGRATION_TEST_CHART)
MAJOR_MINOR_TEST_CHART_VERSION=$(echo "$CURRENT_TEST_CHART_VERSION" | grep -Po '.*(?=\.\d+)')
PATCH_TEST_CHART_VERSION=$(echo "$CURRENT_TEST_CHART_VERSION" | grep -Po '\d+$')
NEW_TEST_CHART_VERSION="${MAJOR_MINOR_TEST_CHART_VERSION}.$((PATCH_TEST_CHART_VERSION + 1))"

sed -i '' "s/^version:.*/version: ${NEW_TEST_CHART_VERSION}/" $MIGRATION_TEST_CHART

# Commit changes
git add $BCIERS_CHART
git add $MIGRATION_TEST_CHART
