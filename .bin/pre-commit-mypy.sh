#!/usr/bin/env bash

set -euxo pipefail

# Navigate to the backend directory
pushd bc_obps || exit 1

make mypy
