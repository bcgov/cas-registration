# Setup for Local Development

1. Install [asdf](https://asdf-vm.com/)
2. Install [poetry](https://python-poetry.org/)
   - if running poetry commands throws errors about the `_hashlib` library, the only solution I've found so far is to downgrade your version of Poetry to <1.2. It's a known, long-lingering bug in poetry.
3. From the `registration/` directory, run `poetry shell` and `poetry install` to install all project dependencies.
4. From the `bc_obps/` directory, run `python3 manage.py runserver`, which will start running the development server locally (default port is :8000; terminal output will indicate what localhost address to use to access the backend server).
   - to test it out, navigate to the `/api/docs` endpoint in your browser, you should see documentation for the /add endpoint
   - navigate to the `api/add?a=4&b=2` endpoint in your browser, which should return as a result the sum of the specified values for a and b.
