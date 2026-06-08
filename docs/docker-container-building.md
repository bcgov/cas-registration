# Building docker containers locally

Our `Dockerfile`s each have a build argument (`ARG`) used to set the relevant code language version (`NODE_VERSION` and `PYTHON_VERSION`).

## CI

When in CI, the version `ARG`s are passed by the `build-{application}.yaml` workflow, which is derived from `.tool-versions`.

## Local

For local building of containers, there are options:

- To your `docker build` command, add `--build-arg {ARG}={VERSION}`, e.g. `--build-arg NODE_VERSION=24.16.0`.
- When using the Nx `container` target, you need to add a `INPUT_BUILD_ARGS` env value, with `NODE_VERSION` and `application_path` subvalues. The two values _must_ be seperated by a newline (_not_ the `\n` escape character). See the [nx-container docs for details](https://nx-tools.vercel.app/docs/nx-container/faq#inline-execution)
  ```shell
  INPUT_BUILD_ARGS="application_path=dashboard
  NODE_VERSION=24.16.0" nx run dashboard:container
  ```
