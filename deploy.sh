#!/bin/bash

# Get the current git branch
echo "Branch: $BRANCH"
# Check if the shipit environment includes 'reg1'
if [[ "$ENVIRONMENT" == *"reg1"* ]]; then
    ENVIRONMENT="${ENVIRONMENT//reg1-/}"
    echo "Running reg1 make target for $ENVIRONMENT environment..."
    make install_reg1
else
    echo "Running default make target..."
    make install
fi
