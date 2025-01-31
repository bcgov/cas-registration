# Install dependencies only when needed
FROM docker.io/node:20.15 AS deps
WORKDIR /usr/src/app
COPY ./package.json .
RUN corepack enable
RUN yarn set version 4.2.0
# Force Yarn to use standard node-modules folder
RUN echo 'nodeLinker: "node-modules"' >> ./.yarnrc.yml
RUN yarn install

# Production image, copy all the files and run next
FROM docker.io/node:20.15 AS runner

# nx/nextjs builds some files into subfolders based on project name. For a unified container, we supply the project name as a path.
ARG application_path

# Build args
# HOST variables are only used in test builds for running e2e in CI
ARG HOST_ADMINISTRATION
ARG HOST_COMPLIANCE
ARG HOST_REGISTRATION
ARG HOST_REPORTING
ENV HOST_ADMINISTRATION=${HOST_ADMINISTRATION}
ENV HOST_COMPLIANCE=${HOST_COMPLIANCE}
ENV HOST_REGISTRATION=${HOST_REGISTRATION}
ENV HOST_REPORTING=${HOST_REPORTING}

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["dumb-init", "--"]

ENV NODE_ENV production
ENV PORT 3000
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules node_modules
COPY --from=deps /usr/src/app/package.json package.json
COPY ./.next/standalone .
COPY ./public ./public
COPY ./.next/static ./dist/${application_path}/.next/static

RUN chmod -R g+rwX ./dist

USER node
EXPOSE 3000
# COPY --chown=node:node ./tools/scripts/entrypoints/api.sh /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT [ "docker-entrypoint.sh" ]
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

# Add an ENV to preserve the build ARG
ENV app_server=apps/${application_path}/server.js

CMD node ${app_server}
