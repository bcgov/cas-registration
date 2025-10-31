#!/usr/bin/env bash
set -euo pipefail

# Get the latest release tag from the main branch, as we consider migrations immutable from that point
git fetch --tags origin main
latest_main_tag=$(git tag --merged origin/main | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n1)
files_diff=$(git diff --name-only origin/main -- bc_obps/**/migrations)

poetry --directory ./bc_obps run python manage.py check_immutable_migration_files --tag "$latest_main_tag" --diff "$files_diff"
