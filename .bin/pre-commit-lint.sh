#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1

# NX requires origin/develop to exist when using --base=origin/develop to determine affected files.
# Fetch it explicitly as a remote tracking branch if it doesn't exist.
if ! git rev-parse --verify origin/develop >/dev/null 2>&1; then
  git fetch origin develop --depth=1
fi

# Use stream output style to avoid TTY requirements entirely.
# See: https://github.com/nrwl/nx/issues/31484
NODE_OPTIONS="--max-old-space-size=5120" yarn nx affected --base=origin/develop --target=lint --parallel --output-style=stream
