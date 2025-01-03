# Stage 1: Build stage
FROM python:3.12.3 AS builder

# Install system dependencies and clean up
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git gnupg curl build-essential && \
    apt-get clean

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/root

WORKDIR ${HOME}

# Install asdf
RUN git clone https://github.com/asdf-vm/asdf.git ${HOME}/asdf --depth 1 --branch v0.11.2

ENV BASH_ENV="${HOME}/asdf/asdf.sh"
SHELL ["/usr/bin/env", "bash", "-c"]

# Source asdf
RUN echo '. ${HOME}/asdf/asdf.sh' >> ${HOME}/.bashrc && \
    echo '. ${HOME}/asdf/completions/asdf.bash' >> ${HOME}/.bashrc

RUN echo -e "python 3.12.3\npoetry 1.8.1" > ${HOME}/.tool-versions

# Install plugins and tools
RUN sed -i -nr '/python|poetry/p' ${HOME}/.tool-versions && \
    . ${HOME}/asdf/asdf.sh && \
    cat ${HOME}/.tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin-add && \
    asdf plugin-update --all && \
    asdf install && \
    asdf reshim

# Add Poetry's bin directory to PATH
ENV PATH="${HOME}/.asdf/installs/poetry/1.8.1/bin:${PATH}"

# Initialize Poetry
RUN . ${HOME}/asdf/asdf.sh && \
    poetry config virtualenvs.prefer-active-python true && \
    poetry config virtualenvs.in-project true

# Copy project files
COPY ./ ${HOME}/

# Install project dependencies using Poetry
RUN poetry install --without dev

# Stage 2: Production stage
FROM python:3.12.3 AS main

# Install system dependencies and clean up
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl build-essential && \
    apt-get clean

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    USER_ID=1001 \
    HOME=/root

WORKDIR ${HOME}

# Copy only necessary files from the build stage
COPY --from=builder ${HOME}/.venv ${HOME}/.venv
COPY ./ ${HOME}/

# Change ownership and permissions
RUN chown -R ${USER_ID}:0 ${HOME} && \
    chmod -R g+rwX ${HOME}

# Add virtual environment to PATH
ENV PATH="${HOME}/.venv/bin:${PATH}"

# Expose the port your Django application will run on
EXPOSE 8000

# Switch to non-root user
USER ${USER_ID}

# Command to run the application
CMD ["/usr/bin/env", "bash", "-c", "python manage.py collectstatic --noinput && python manage.py custom_migrate && gunicorn --access-logfile - bc_obps.wsgi:application --timeout 200 --workers 3 --bind '0.0.0.0:8000'"]
