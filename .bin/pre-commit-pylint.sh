#!/usr/bin/env bash
set -euxo pipefail

pushd bc_obps || exit 1

pwd

echo $PATH

# # Get the Poetry virtual environment path and save it in a variable
# VENV_PATH=$(poetry env info --path)
curl -sSL https://install.python-poetry.org | python3 -
which poetry

poetry --version

# # Activate the virtual environment
# source "$VENV_PATH/bin/activate"

# Run pylint on the bc_obps folder
# poetry run pylint --rcfile=.pylintrc *.py
