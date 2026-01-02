#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1
files=("$@")
files=("${files[@]/#/../}") # add ../ to each element

NODE_OPTIONS="--max-old-space-size=6144" yarn run eslint --cache --cache-location .eslintcache "${files[@]}"
