#!/usr/bin/env bash
cd ../bc_obps

# Activate the Poetry virtual environment
poetry shell

# Run pylint on the bc_obps folder
poetry run pylint --rcfile=.pylintrc *.py
