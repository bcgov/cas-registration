#!/usr/bin/env bash
set -euxo pipefail

pushd bc_obps || exit 1

# Install poetry
curl -sSL https://install.python-poetry.org | python3 -
# Activate the virtual environment
source $(poetry env info --path)/bin/activate

# Run pylint on the bc_obps folder
poetry run pylint --rcfile=.pylintrc *.py
