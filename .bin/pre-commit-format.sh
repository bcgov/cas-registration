#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1

yarn nx format:write --uncommitted
