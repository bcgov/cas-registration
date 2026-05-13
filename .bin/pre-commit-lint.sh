#!/usr/bin/env bash

# We don't use `nx affected --target=lint` because nx 22 spawns each task in
# a pseudo-terminal, and CI runners exhaust their PTY pool when a shared lib
# fans out to many projects, crashing the job with a Rust panic. Upstream:
# https://github.com/nrwl/nx/issues/22445 (closed "Not Planned").
#
# Workaround: ask nx which projects are affected (a read-only graph query —
# no task execution, no PTY) and run ESLint on those project folders directly.

set -euxo pipefail

pushd bciers || exit 1

# NX requires origin/develop to exist when using --base=origin/develop to determine affected files.
# Fetch it explicitly as a remote tracking branch if it doesn't exist.
if ! git rev-parse --verify origin/develop >/dev/null 2>&1; then
  git fetch origin develop --depth=1
fi

affected=$(yarn nx show projects \
  --affected --base=origin/develop \
  --with-target=lint)

if [[ -z "$affected" ]]; then
  echo "No affected projects with a lint target."
  exit 0
fi

# Every project in this repo lives at apps/<name> or libs/<name>, and project
# names match folder names. If a future project breaks that convention, fail
# loudly rather than silently skip it.
roots=()
for project in $affected; do
  if [[ -d "apps/$project" ]]; then
    roots+=("apps/$project")
  elif [[ -d "libs/$project" ]]; then
    roots+=("libs/$project")
  else
    echo "Could not find folder for project: $project" >&2
    exit 1
  fi
done

yarn run eslint --quiet "${roots[@]}"
