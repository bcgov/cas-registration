#!/bin/bash

# Get the current git branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Check if the current branch is 'develop'
if [ "$current_branch" == "giraffe-develop" ]; then
    echo "Running giraffe make target..."
    make install-giraffe
else
    echo "Running default make target..."
    make install
fi
