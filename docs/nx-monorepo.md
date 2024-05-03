# Our Monorepo supported by Nx

## Welcome to the Monorepo 🚝

Note: The monorepo uses Node v20's Corepack Yarn and assumes a global install of nx (`npm add --global nx@18.2.1`). If you don't want to install it globally, prepend all `nx ...` commands: `yarn nx ...`

### General commands

When running commands, Nx has two patterns you can use

- `nx run {project}:{target}`: ie. `nx run registration:dev` to run the equivalent of `yarn dev` within the registration folder. **Recommended**
  - You can also do things like `nx run-many --target=test` to test _all_ projects in the monorepo in parallel.
- `nx {target} {project}`: ie. `nx dev registration` to run the equivalent of `yarn dev` within the registration folder.

#### Common command examples

> Replace `{project}` with the application you want to use. ie. `nx run registration:dev`, `nx run reporting:build`.

| Client                                           | Monorepo 🚝                                                                          | Notes                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `yarn format`                                    | `nx format:check`                                                                    | Use `--projects {project1},{project2}` to select individual projects |
| `yarn format --write`                            | `nx format:write`                                                                    | Use `--projects {project1},{project2}` to select individual projects |
| `yarn dev`                                       | `nx run {project}:dev`                                                               |                                                                      |
| `yarn build`                                     | `nx run {project}:build`                                                             |                                                                      |
| `yarn start`                                     | `nx run {project}:start`                                                             |                                                                      |
| `yarn test`                                      | `nx run {project}:test`                                                              |                                                                      |
| `yarn e2e`, `yarn e2e:ui`, `yarn e2e:sequential` | `nx run {project}:e2e`, `nx run {project}:e2e:ui`, `nx run {project}:e2e:sequential` |                                                                      |
| `yarn audit-deps`                                | `yarn npm audit`                                                                     |                                                                      |

#### Current projects

| Project        | Location                         | Type        |
| -------------- | -------------------------------- | ----------- |
| `registration` | `/bciers/apps/registration`      | application |
| `reporting`    | `/bciers/apps/reporting`         | application |
| `components`   | `/bciers/libs/shared/components` | library     |
| `img`          | `/bciers/libs/shared/img`        | library     |
| `styles`       | `/bciers/libs/shared/styles`     | library     |
| `testConfig`   | `/bciers/libs/shared/testConfig` | library     |

### General tips

- There are [Nx plugins for VSCode, JetBrains, and Neovim](https://nx.dev/getting-started/editor-setup) that shows all your projects, targets and other features.
- Packages should be added in `./bciers/package.json`. Nx will shake any required packages into the proper projects.

## Nx builds 🔨

The _Reporting_ application container is built using Nx. Automation is in place in GitHub workflows (`{repo}/.github/workflows/test.yaml`) to build NextJS with Nx, containerize, then push the container to GitHub Container Registry.

### Running the build 🏃

> You may need to run `yarn` in the `{repo}/bciers` directory to install and update packages. Additionally, while eventually everything will be bundled and handled by Nx, currently there are pieces being imported from the non-monorepo folder of Registration `{repo}/client`. Due to this, you must also ensure packages are up-to-date there as well.

1. Navigate to `{repo}/bciers` and run (if nx is not installed globally, add `npx` first to the following) `nx run reporting:container --skip-nx-cache`. Next.JS should be built and then a container made from that build.

### Nx features in use ✨

- Added a Nx build (nx build reporting) target for the _Reporting_ frontend.
- Added a Nx target (nx container reporting) to containerize the _Reporting_ frontend with Docker.

### Helm template ⛑️

A set of helm templates have been created in `{repo}/helm/cas-registration/templates/reporting` that conditionally deploy the pods and support infrastructure for the _Reporting_ application. The conditionality is a feature flag a `.values.reportingFrontend.enabled` boolean, which is set to true only in `value-giraffe.yaml`. This is used by the `make install_giraffe` target.

### Nx Notes 📝

- As more of the existing applications get brought into the monorepo tooling, we'll be able to reduce the existing CI builds and handle them with Nx instead.
  - There's a chance we might have to re-think how we handle tagging, purely due to the fact that Nx can be used to only build what changes. We generally build _everything_ and tag it.
- I've documented some possible optimizations from Nx we could utilize, will share those in a [GitHub Project issue](https://github.com/orgs/bcgov/projects/123/views/1?filterQuery=-status%3Adone+nx&pane=issue&itemId=55856106) for future investigation.

## Nx Generators 🦾

### Creating new components 📻

For further information, see the [Nx docs about @nx/next generators](https://nx.dev/nx-api/next/generators/component).

#### Client components

If you are creating a React client component (or a non-React importable), you can scaffold the new component with `nx generate @nx/next:component component-name --directory libs/shared/components/src/lib/component-name`, where `component-name` is the name of the new component. You'll then want to export the module through the `libs/shared/components/src/index.ts` file. This this gets picked up by the root `tsconfig.base.json`.

Components can then be imported with `import { component-name } from "@bciers/components".

#### Server components

If you are creating a React sever component, you can scaffold a new component with `nx generate @nx/next:component component-name --directory libs/shared/components/src/lib/component-name`, where `component-name` is the name of the new component (just like with client components). You'll then want to export the module through the `libs/shared/components/src/server.ts` file. This this gets picked up by the root `tsconfig.base.json`.

Components can then be imported with `import { component-name } from "@bciers/components/server"`.
