# Install dependencies only when needed
FROM docker.io/node:20.15 AS deps

ARG application_path
WORKDIR /usr/src/app
COPY ./package.json .
RUN corepack enable
RUN yarn set version 4.2.0
# Force Yarn to use standard node-modules folder
RUN echo 'nodeLinker: "node-modules"' >> ./.yarnrc.yml
RUN yarn install

# Production image, copy all the files and run next
FROM docker.io/node:20.15 AS runner

ARG application_path

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

USER node
EXPOSE 3000
# COPY --chown=node:node ./tools/scripts/entrypoints/api.sh /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT [ "docker-entrypoint.sh" ]
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1
# Add an env to save ARG
ENV app_server=apps/${application_path}/server.js

CMD node ${app_server}
