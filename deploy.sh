#!/bin/bash

# Get the current git branch
echo "Branch: $BRANCH"

# Check if the current branch is 'giraffe-develop'
if [[ "$ENVIRONMENT" =~ "reporting" ]]; then
    ENVIRONMENT="${ENVIRONMENT#*-}"
    echo "Running giraffe make target for $(ENVIRONMENT) environment..."
    make install_giraffe
else
    echo "Running default make target..."
    make install
fi
