#!/usr/bin/env bash

set -euo pipefail

# Navigate to the backend directory
pushd bc_obps || exit 1

# Check makemigrations
if ! poetry run python manage.py makemigrations --check --dry-run; then
  echo "Data models are not aligned with the migrations. Run 'make makemigrations' or remove redundant migration files."
  exit 1
fi

# Check migrations
if ! poetry run python manage.py migrate --check; then
  echo "Your database is not aligned with the migrations. Run 'make migrate' to update the database or 'make reset_db' to reset the database."
  exit 1
fi
