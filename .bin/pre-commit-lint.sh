#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1

NODE_OPTIONS="--max-old-space-size=5120" yarn nx affected --target=lint --base=origin/develop --parallel
