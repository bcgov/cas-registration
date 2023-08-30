# Setup for Local Development

1. Install asdf
2. Install poetry
   - if running poetry commands throws errors about the `_hashlib` library, the only solution I've found so far is to downgrade your version of Poetry to <1.2. It's a known, long-lingering bug in poetry.
3. From the `registration/` directory, run `poetry shell` and `poetry install` to install all project dependencies.