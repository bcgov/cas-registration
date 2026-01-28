#!/usr/bin/env bash

set -euxo pipefail

pushd bciers || exit 1

# NX requires origin/develop to exist when using --base=origin/develop to determine affected files.
# Fetch it explicitly as a remote tracking branch if it doesn't exist.
if ! git rev-parse --verify origin/develop >/dev/null 2>&1; then
  git fetch origin develop --depth=1
fi

# Use --no-tui to disable interactive terminal UI that causes TTY panic in CI.
NODE_OPTIONS="--max-old-space-size=5120" yarn nx affected --base=origin/develop --target=lint --parallel --no-tui
