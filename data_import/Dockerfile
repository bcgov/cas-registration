# Use an official Python runtime as a parent image
FROM postgres:16.6
# Set environment variables
ENV USER_ID=1001 \
    HOME=/root

WORKDIR ${HOME}

COPY ./ ${HOME}/

RUN useradd -ms /bin/bash -d ${HOME} --uid ${USER_ID} -g root client && \
    chown -R client:0 ${HOME} && \
    chmod -R g+rwX ${HOME}

USER ${USER_ID}
