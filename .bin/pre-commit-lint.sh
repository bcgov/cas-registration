#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1
files=("$@")
files=("${files[@]/#/../}") # add ../ to each element

yarn run eslint "${files[@]}"
