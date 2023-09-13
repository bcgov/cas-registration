#!/usr/bin/env bash

set -euxo pipefail

pushd client || exit 1
files=("$@")
files=("${files[@]/#/../}") # add ../ to each element

#yarn run eslint "${files[@]}"
yarn eslint -c ./.eslintrc.js "${files[@]}"
