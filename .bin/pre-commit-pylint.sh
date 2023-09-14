#!/usr/bin/env bash
set -euxo pipefail

pushd bc_obps || exit 1

# Install and activate the Poetry virtual environment
make install_poetry

# Run pylint on the bc_obps folder
poetry run pylint --rcfile=.pylintrc *.py
