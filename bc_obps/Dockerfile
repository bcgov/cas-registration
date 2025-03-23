####################
# Base Stage
####################
FROM python:3.12.3-slim AS base

# Prevent Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1 \
# Ensure Python output is sent straight to terminal (no buffering)
    PYTHONUNBUFFERED=1 \
# Define a user ID for the non-root user
    USER_ID=1001 \
# Set the home and working directory to /app
    HOME=/app \
# Prevent apt-get from prompting during installs
    DEBIAN_FRONTEND=noninteractive

WORKDIR ${HOME}

# Recreate bc_obps user with bash shell
RUN useradd -ms /bin/bash -d ${HOME} --uid ${USER_ID} -g root bc_obps && \
    chown -R bc_obps:0 ${HOME} && \
    chmod -R g+rwX ${HOME}

####################
# Builder Stage
####################
FROM base AS builder

# Refresh package lists from repositories
RUN apt-get update && \
# Install minimal build tools required for asdf (git), curl for Poetry plugin, build-essential for compiling Python, and additional libs for Python
    apt-get install -y --no-install-recommends build-essential curl git libc6-dev libffi-dev libssl-dev zlib1g-dev && \
# Remove apt cache to reduce image size
    apt-get clean && \
# Delete package lists to further slim the image
    rm -rf /var/lib/apt/lists/*

# Copy version config and Poetry files with ownership set to bc_obps
COPY --chown=bc_obps:0 .tool-versions pyproject.toml poetry.lock ${HOME}/

USER ${USER_ID}

# Clone asdf shallowly from GitHub
RUN git clone --depth 1 --branch v0.11.2 https://github.com/asdf-vm/asdf.git ${HOME}/asdf

# Ensure asdf is available in non-interactive shells
ENV BASH_ENV="${HOME}/asdf/asdf.sh"

# Use bash with environment sourcing for asdf commands
SHELL ["/bin/bash", "-c"]

# Filter .tool-versions for python and poetry
RUN sed -i -nr '/python|poetry/p' ${HOME}/.tool-versions && \
# Add plugins for each tool listed in .tool-versions
    cat ${HOME}/.tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin-add && \
# Update all plugins to latest versions
    asdf plugin-update --all && \
# Install tools (Python, Poetry) from .tool-versions
    asdf install && \
# Regenerate shims for installed tools
    asdf reshim

# Extract Poetry version from .tool-versions
RUN export POETRY_VERSION=$(grep '^poetry ' ${HOME}/.tool-versions | awk '{print $2}') && \
# Add Poetry to PATH in bashrc
    echo "export PATH=${HOME}/.asdf/installs/poetry/${POETRY_VERSION}/bin:${PATH}" >> ${HOME}/.bashrc

RUN poetry config virtualenvs.create true && \
# Keep virtualenv in project directory (.venv)
    poetry config virtualenvs.in-project true && \
# Install dependencies without dev group, non-interactively
    poetry install --without dev --no-root --no-interaction --no-ansi

# Copy all remaining files, owned by bc_obps
COPY --chown=bc_obps:0 . ${HOME}/

####################
# Runner Stage
####################
FROM base AS runner

# Refresh package lists from repositories
RUN apt-get update && \
# Install essential runner packages
    apt-get install -y --no-install-recommends curl && \
# Clean apt cache
    apt-get clean && \
# Remove package lists to reduce size
    rm -rf /var/lib/apt/lists/*

# Copy application from the builder stage
COPY --from=builder --chown=bc_obps:0 ${HOME}/ ${HOME}/

USER ${USER_ID}

# Source asdf in non-interactive shells
ENV BASH_ENV="${HOME}/asdf/asdf.sh"
# Set PATH explicitly to include Poetry binary
ENV PATH="${HOME}/.asdf/shims:${HOME}/.asdf/bin:${PATH}"

# Make port 8000 available for external connections
EXPOSE 8000

# Check every 30s with a 3s timeout
HEALTHCHECK --interval=30s --timeout=3s \
# Fail if curl request fails
    CMD curl -f http://localhost:8000/ || exit 1

CMD ["/bin/bash", "-c", "poetry run python manage.py collectstatic --noinput && poetry run python manage.py custom_migrate && poetry run gunicorn --access-logfile - bc_obps.wsgi:application --timeout 200 --workers 3 --bind '0.0.0.0:8000'"]
