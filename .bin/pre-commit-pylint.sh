#!/usr/bin/env bash
set -euxo pipefail

pushd bc_obps || exit 1

# Get the Poetry virtual environment path and save it in a variable
# VENV_PATH=$(poetry env info --path)
curl -sSL https://install.python-poetry.org | python3 -
which poetry

poetry run pylint --version
# Activate the virtual environment
# Creating virtualenv registration-ucQVSwfn-py3.10 in /home/runner/.cache/pypoetry/virtualenvs
# source /home/runner/.cache/pypoetry/virtualenvs/bc-obps-3Z4QX3ZS-py3.8/bin/activate
poetry install

echo "Install poetry Done"

# Run pylint on the bc_obps folder
poetry run pylint --rcfile=.pylintrc *.py
