#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1

# NX requires origin/develop to exist when using --base=origin/develop to determine affected files.
# Fetch it explicitly as a remote tracking branch if it doesn't exist.
if ! git rev-parse --verify origin/develop >/dev/null 2>&1; then
  git fetch origin develop --depth=1
fi

# Wrap Nx command with 'script' to provide a pseudo-TTY for CI environments.
# Nx v18+ requires a TTY and panics with "No such device or address" in GitHub Actions.
# See: https://github.com/nrwl/nx/issues/22445
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS: script doesn't support -c flag, run directly
  NODE_OPTIONS="--max-old-space-size=5120" yarn nx affected --base=origin/develop --target=lint --parallel
else
  # Linux: use script with -c flag for pseudo-TTY
  NODE_OPTIONS="--max-old-space-size=5120" script -qec "yarn nx affected --base=origin/develop --target=lint --parallel" /dev/null
fi
