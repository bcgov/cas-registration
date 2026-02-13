# Continuous Integration

## Workflows

Our main CI workflow is defined in the `.github/workflows/main.yaml` file. Checks (including `nx affected`) are used in Pull Requests to detect changes to the frontend projects or backend and conditionally run tests for those components..

> [!TIP]
> To trigger the full CI workflow on a PR, simply add the :label:`run-all-ci` label to the PR. This will run all tests and E2E for the PR.

## Sonarcloud Integration

Our project benefits from Sonarcloud integration, a static code analysis tool seamlessly integrated with Github. This integration is configured to automatically run on every pull request, identifying and reporting code issues for quick resolution. You can view the results and analysis insights on the [Sonarcloud dashboard](https://sonarcloud.io/project/overview?id=bcgov_cas-registration).

For advanced customization and configuration, we've provided a `.sonarcloud.properties` file. This file allows you to fine-tune Sonarcloud analysis settings to suit your project's unique requirements and code quality standards.
