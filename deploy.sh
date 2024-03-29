#!/bin/bash

# Get the current git branch
echo "Branch: $BRANCH"

# Check if the current branch is 'develop'
if [ "$BRANCH" == "giraffe-develop" ]; then
    echo "Running giraffe make target..."
    make install-giraffe
else
    echo "Running default make target..."
    make install
fi
