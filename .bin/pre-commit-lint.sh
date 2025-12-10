#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1
files=("$@")
files=("${files[@]/#/../}") # add ../ to each element

NODE_OPTIONS="--max-old-space-size=8192" yarn run eslint "${files[@]}"
