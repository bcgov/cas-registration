####################
# Base Stage
####################
FROM dhi.io/python:3.12.13-debian13-dev AS base

# Prevent Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1 \
    # Ensure Python output is sent straight to terminal (no buffering)
    PYTHONUNBUFFERED=1 \
    # Define a user ID for the non-root user
    USER_ID=1001 \
    # Set the home and working directory to /app
    HOME=/app \
    # Prevent apt-get from prompting during installs
    DEBIAN_FRONTEND=noninteractive \
    # Set asdf version
    ASDF_VERSION=0.15.0

WORKDIR ${HOME}

# Grant the numbered user complete access to the workspace root directory
RUN chown -R ${USER_ID}:0 ${HOME} && \
    chmod -R g+rwX ${HOME}

####################
# Builder Stage
####################
FROM base AS builder

# Refresh package lists from repositories
RUN apt-get update && \
# Install minimal tools and dependencies
    apt-get install -y --no-install-recommends build-essential curl && \
# Remove apt cache to reduce image size
    apt-get clean && \
# Delete package lists to further slim the image
    rm -rf /var/lib/apt/lists/*

# Add bin path for poetry
ENV PATH="/app/.local/bin:${PATH}"

# Copy version config and Poetry files with ownership set to numbered user
COPY --chown=${USER_ID}:0 .tool-versions pyproject.toml poetry.lock ${HOME}/

USER ${USER_ID}

# Use bash with environment sourcing for asdf commands
SHELL ["/bin/bash", "-c"]

# Configure Poetry and install dependencies
# Extract Poetry version from .tool-versions
RUN POETRY_VERSION=$(grep '^poetry ' ${HOME}/.tool-versions | awk '{print $2}') && \
    # Use inbuilt Python to install Poetry
    curl -sSL https://install.python-poetry.org | python3 - && \
    # Add Poetry to PATH in bashrc
    # Keep virtualenv in project directory (.venv)
    ${HOME}/.local/bin/poetry config virtualenvs.create true && \
    ${HOME}/.local/bin/poetry config virtualenvs.in-project true && \
    # Install dependencies without dev group, non-interactively
    ${HOME}/.local/bin/poetry install --without dev --no-root --no-interaction --no-ansi --compile

# Copy all remaining files, owned by numbered user
COPY --chown=${USER_ID}:0 . ${HOME}/

####################
# Runner Stage
####################
FROM base AS runner

# Refresh package lists from repositories
RUN apt-get update && \
    # Install essential runner packages and WeasyPrint dependencies
    apt-get install -y --no-install-recommends \
    curl \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-liberation && \
    # Clean apt cache
    apt-get clean && \
    # Remove package lists to reduce size
    rm -rf /var/lib/apt/lists/*

# Copy application from the builder stage
COPY --from=builder --chown=${USER_ID}:0 ${HOME}/ ${HOME}/

# Remove asdf and Poetry files
RUN rm .tool-versions pyproject.toml poetry.lock

USER ${USER_ID}

# Make port 8000 available for external connections
EXPOSE 8000

# Check every 30s with a 3s timeout
HEALTHCHECK --interval=30s --timeout=3s \
    # Fail if curl request fails
    CMD curl -f http://localhost:8000/ || exit 1

# Collect static files using the virtual environment's Python
RUN ${HOME}/.venv/bin/python manage.py collectstatic --noinput

# Run migrations and start gunicorn directly from the virtual environment
CMD ["/bin/bash", "-c", "${HOME}/.venv/bin/python manage.py custom_migrate && ${HOME}/.venv/bin/gunicorn --access-logfile - bc_obps.wsgi:application --timeout 200 --workers 3 --bind '0.0.0.0:8000'"]
