#!/usr/bin/env bash
set -euxo pipefail

pushd bc_obps || exit 1


# export VIRTUAL_ENV_DISABLE_PROMPT=1
# poetry shell

# # Get the Poetry virtual environment path and save it in a variable
# VENV_PATH=$(poetry env info --path)

# # Activate the virtual environment
# source "$VENV_PATH/bin/activate"

# Run pylint on the bc_obps folder
poetry run pylint --rcfile=.pylintrc *.py
