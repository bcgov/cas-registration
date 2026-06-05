# In CI, the Node version is specified in the build args, taken from .tool-versions
# TODO: Add docs for building locally
ARG NODE_VERSION

####################
# Base Stage
####################
FROM dhi.io/node:${NODE_VERSION}-alpine3.23-dev AS base

####################
# Bundler Stage
# - Dependencies built by Nx build
# - DockerHardenedImages (DHI.io)-dev image includes shell for setup
####################
FROM base AS bundler

# nx/nextjs builds some files into subfolders based on project name. For a unified container, we supply the project name as a path.
ARG application_path
WORKDIR /usr/src/app

COPY ./.next/standalone .
COPY ./public ./apps/${application_path}/public
# Create a symlink so the entrypoint is ALWAYS at /usr/src/app/server.js
RUN ln -s /usr/src/app/apps/${application_path}/server.js /usr/src/app/server.js
COPY ./.next/static ./dist/${application_path}/.next/static

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
####################
# Runner Stage
# - Uses DHI.io runtime image which does not include shell
# - Production image, copy all the files and run next
####################
FROM base AS runner

# HOST variables are only used in test builds for running e2e in CI
ARG HOST_ADMINISTRATION
ARG HOST_COMPLIANCE
ARG HOST_REGISTRATION
ARG HOST_REPORTING

ENV HOST_ADMINISTRATION=${HOST_ADMINISTRATION}
ENV HOST_COMPLIANCE=${HOST_COMPLIANCE}
ENV HOST_REGISTRATION=${HOST_REGISTRATION}
ENV HOST_REPORTING=${HOST_REPORTING}

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /usr/src/app

# Copy application and dumb-init from bundler
# Writable .next directory: The .next directory is owned by the node user so the server can write prerender cache and optimized images at runtime
COPY --from=bundler --chown=node:node /usr/src/app ./
COPY --from=bundler --chown=node:node /usr/local/bin/dumb-init /usr/local/bin/dumb-init

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

USER node
EXPOSE 3000
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]
