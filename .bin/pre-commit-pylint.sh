#!/usr/bin/env bash
set -euxo pipefail

pushd bc_obps || exit 1

# Run pylint on the bc_obps folder
poetry run pylint --rcfile=.pylintrc *.py
