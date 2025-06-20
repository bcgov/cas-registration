#!/usr/bin/env bash
set -euo pipefail

latest_tag=$(git describe --tags --abbrev=0)
files_diff=$(git diff --name-only origin/main -- bc_obps/**/migrations)

poetry --directory ./bc_obps run python manage.py check_immutable_migration_files --tag "$latest_tag" --diff "$files_diff"
