# Frontend Delopment Guidelines

## Overview

Registration Part II is a separate Nx/NextJS application from Registration Part I. Development is fairly straightforward coming from Part I, but there are some key differences to keep in mind.

## Running the apps

### Registration Part I commands

Registration Part I commands have changed to use reg1 instead of reg prefix. To run the Registration Part I application, use `yarn reg1` command in the `/bciers` directory.

| Command alias     | Nx command                             |
| ----------------- | -------------------------------------- |
| `reg1`            | `nx dev registration1`                 |
| `reg1:build`      | `nx run registration1:build`           |
| `reg1:test`       | `nx run registration1:test`            |
| `reg1:e2e`        | `nx run registration1:e2e`             |
| `reg1:e2e:ui`     | `nx run registration1:e2e:ui`          |
| `reg1:e2e:report` | `nx run registration1:report`          |
| `reg1:coverage`   | `nx run registration1:test --coverage` |

### Registration Part II commands

To run the Registration Part II application, use the `yarn reg` command that previously ran the Registration Part I application.

| Command alias    | Nx command                            |
| ---------------- | ------------------------------------- |
| `reg`            | `nx dev registration`                 |
| `reg:build`      | `nx run registration:build`           |
| `reg:test`       | `nx run registration:test`            |
| `reg:e2e`        | `nx run registration:e2e`             |
| `reg:e2e:ui`     | `nx run registration:e2e:ui`          |
| `reg:e2e:report` | `nx run registration:report`          |
| `reg:coverage`   | `nx run registration:test --coverage` |

## Shared components

Many of the components have been moved to the shared compopnents library which is shared between all applications in this monorepo. As such, when modifying a component be extra careful to ensure that the changes are not breaking other applications. For the development of Registration Part II, we have disabled Sonarcloud duplication scanning. If you need to make breaking modifications to a shared component, either modify the component to accept new customizations, or if it makes sense just copy the component to `/bciers/apps/regisrations/app/components` directory and modify it there.

Refer to the [Nx docs about @nx/next generators](https://nx.dev/nx-api/next/generators/component) for more information on creating new components.

### Importing shared components

When importing shared components, use the `@bciers/components` alias which is an alias for our shared components folder located in: `@bciers/libs/components/src/*`.

Example:

`import FormBase from '@bciers/components/form/FormBase';`

Alias paths can be modified in the `tsconfig.base.json` file in the `/bciers` directory.
