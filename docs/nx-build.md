# Nx builds 🔨

The _Reporting_ application container is built using Nx. Automation is in place in GitHub workflows (`{repo}/.github/workflows/test.yaml`) to build NextJS with Nx, containerize, then push the container to GitHub Container Registry.

## Running the build 🏃

> You may need to run `yarn` in the `{repo}/bciers` directory to install and update packages. Additionally, while eventually everything will be bundled and handled by Nx, currently there are pieces being imported from the non-monorepo folder of Registration `{repo}/client`. Due to this, you must also ensure packages are up-to-date there as well.

1. Navigate to `{repo}/bciers` and run (if nx is not installed globally, add `npx` first to the following) `nx container reporting --skip-nx-cache`. Next.JS should be built and then a container made from that build.

## Nx features in use ✨

- Added a Nx build (nx build reporting) target for the _Reporting_ frontend.
- Added a Nx target (nx container reporting) to containerize the _Reporting_ frontend with Docker.

## Helm template ⛑️

A set of helm templates have been created in `{repo}/helm/cas-registration/templates/reporting` that conditionally deploy the pods and support infrastructure for the _Reporting_ application. The conditionality is a feature flag a `.values.reportingFrontend.enabled` boolean, which is set to true only in `value-giraffe.yaml`. This is used by the `make install_giraffe` target.

## Nx Notes 📝

- Parts of the GitHub Actions CI will need to be re-written once `giraffe-develop` gets merged into the core `develop`.
- As more of the existing applications get brought into the monorepo tooling, we'll be able to reduce the existing CI builds and handle them with Nx instead.
  - There's a chance we might have to re-think how we handle tagging, purely due to the fact that Nx can be used to only build what changes. We generally build _everything_ and tag it.
- I've documented some possible optimizations from Nx we could utilize, will share those in a [GitHub Project issue](https://github.com/orgs/bcgov/projects/123/views/1?filterQuery=-status%3Adone+nx&pane=issue&itemId=55856106) for future investigation.
