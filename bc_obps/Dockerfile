# Use an official Python runtime as a parent image
FROM python:3.12.3 AS main

# Install system dependencies and clean up
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git gnupg curl build-essential && \
    apt-get clean

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    USER_ID=1001 \
    HOME=/root

WORKDIR ${HOME}
# Make everything in the home group-writable to support OpenShift's restricted SCC
# Needs to be done as root to chown
RUN useradd -ms /bin/bash -d ${HOME} --uid ${USER_ID} -g root bc_obps

COPY ./ ${HOME}/

# Install asdf
RUN git clone https://github.com/asdf-vm/asdf.git ${HOME}/asdf --depth 1 --branch v0.11.2

ENV BASH_ENV="${HOME}/asdf/asdf.sh"
# Because asdf is loaded via BASH_ENV, all commands using adsf need to be executed using /usr/bin/env bash -c
SHELL ["/usr/bin/env", "bash", "-c"]

RUN sed -i -nr '/python|poetry/p' ${HOME}/.tool-versions && \
    cat ${HOME}/.tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin-add && \
    asdf plugin-update --all && \
    asdf install && \
    asdf reshim

# Get poetry version from .tool-versions
poetry_version=$(grep poetry .tool-versions | awk '{print $2}')
# Add Poetry's bin directory to PATH
ENV PATH="${HOME}/.asdf/installs/poetry/${poetry_version}/bin:${PATH}"

# Configuring poetry to behave properly with asdf
RUN poetry config virtualenvs.prefer-active-python true

# Change ownership and permissions
RUN chown -R bc_obps:0 ${HOME} && \
    chmod -R g+rwX ${HOME}

# Expose the port your Django application will run on (change as needed)
EXPOSE 8000

# Install project dependencies using Poetry
RUN poetry install --without dev
USER ${USER_ID}
CMD ["/usr/bin/env", "bash", "-c", "poetry run python manage.py collectstatic --noinput && poetry run python manage.py custom_migrate && poetry run gunicorn --access-logfile - bc_obps.wsgi:application --timeout 200 --workers 3 --bind '0.0.0.0:8000'"]
