#!/bin/bash

# Get the current git branch
echo "Branch: $BRANCH"

# Check if the current branch is 'giraffe-develop'
if [ "$BRANCH" == "giraffe-develop" ]; then
    echo "Running giraffe make target..."
    make install_giraffe
else
    echo "Running default make target..."
    make install
fi
