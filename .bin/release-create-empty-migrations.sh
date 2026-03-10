#!/usr/bin/env bash

set -euxo pipefail

RELEASE_VERSION=$(echo "$1" | tr '.' '_')

cd bc_obps
poetry run python manage.py create_empty_migrations "$RELEASE_VERSION"
git add */migrations/*.py
