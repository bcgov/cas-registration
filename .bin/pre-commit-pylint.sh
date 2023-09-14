#!/usr/bin/env bash
cd ../bc_obps

# Install and activate the Poetry virtual environment
make install_poetry

# Run pylint on the bc_obps folder
poetry run pylint --rcfile=.pylintrc *.py
