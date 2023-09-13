#!/usr/bin/env bash

set -euxo pipefail

pushd client || exit 1
files=("$@")
files=("${files[@]/#/../}") # add ../ to each element

# --ignore-unknown prevents prettier from complaining about file types it doesn't know about
yarn run prettier --ignore-unknown --write "${files[@]}"
