#!/usr/bin/env bash
set -euox pipefail


latest_tag=$(git describe --tags --abbrev=0)
