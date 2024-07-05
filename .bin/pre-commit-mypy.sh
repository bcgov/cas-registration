#!/usr/bin/env bash

set -euxo pipefail

# Navigate to the backend directory
pushd bc_obps || exit 1
# Not using the cache in pre-commit as it was causing issues when switching branches
# If you are troubleshooting mypy issues, just run `make mypy` in the `bc_obps` directory to benefit from the mypy incremental mode and cache
make mypy ARGS="--cache-dir=/dev/null"
