#!/usr/bin/env bash

set -euxo pipefail

# Navigate to the backend directory or specify the correct path
pushd bc_obps || exit 1

# List of applications to process
apps=("common" "registration" "reporting")

# Loop through each application and generate diagrams
for app in "${apps[@]}"; do
    echo "Generating diagram for $app..."
    poetry run python -m django_diagram --app="$app" --output="../erd_diagrams/erd_$app.md" --settings=bc_obps.settings
done
