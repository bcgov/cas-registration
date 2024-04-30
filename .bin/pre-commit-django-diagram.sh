#!/usr/bin/env bash

set -euxo pipefail

# Navigate to the backend directory or specify the correct path
pushd bc_obps || exit 1

# Run the Django diagram tool via Poetry
poetry run python -m django_diagram --app=registration --output=../erd.md --settings=bc_obps.settings
