# Frontend Setup Guide

This guide will help you set up the frontend development environment for the CAS Registration project.

## Prerequisites

### Required Tools
1. **Node.js**
   - Version: 20.11.0 (as specified in `.tool-versions`)
   - Required for running the JavaScript/TypeScript codebase

2. **Package Manager**
   - Yarn (Modern version using `.yarnrc.yml`)
   - Used for managing project dependencies

3. **Version Manager**
   - asdf (recommended)
   - Helps manage tool versions consistently across the team

### System Requirements
- Linux/Unix-based system or WSL for Windows users
- Git (for version control)
- Docker and Docker Compose (for containerized development)

## Installation Guide

### Using asdf (Recommended Method)

1. **Install asdf** (if not already installed)
   ```bash
   git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.15.0
   echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc
   echo '. "$HOME/.asdf/completions/asdf.bash"' >> ~/.bashrc
   ```

2. **Install Node.js plugin**
   ```bash
   asdf plugin add nodejs
   ```

3. **Install Node.js**
   ```bash
   asdf install nodejs 20.11.0
   ```

4. **Set Node.js version globally or locally**
   ```bash
   asdf global nodejs 20.11.0  # for global setting
   # OR
   asdf local nodejs 20.11.0   # for project-specific setting
   ```

### Alternative Method (Without asdf)

1. **Install Node.js 20.11.0**
   - Using nvm:
     ```bash
     nvm install 20.11.0
     nvm use 20.11.0
     ```
   - Or download directly from [Node.js website](https://nodejs.org/)

2. **Install Yarn**
   ```bash
   corepack enable
   ```

## Project Setup

1. **Clone the repository** (if not already done)
   ```bash
   git clone https://github.com/bcgov/cas-registration.git
   cd cas-registration/bciers
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local
   ```
   Edit `.env.local` with your local configuration values

## Project Structure

The frontend is organized as a monorepo using Nx, containing multiple applications and shared libraries.

### Applications

| Application | Path | Description |
|-------------|------|-------------|
| `dashboard` | `/bciers/apps/dashboard` | Dashboard application |
| `registration` | `/bciers/apps/registration` | Registration application |
| `reporting` | `/bciers/apps/reporting` | Reporting application |
| `registration1` | `/bciers/apps/registration1` | Alternative registration application |
| `administration` | `/bciers/apps/administration` | Administration interface |
| `coam` | `/bciers/apps/coam` | COAM application |

### Shared Libraries

Located in `/bciers/libs/shared/`:

| Library | Path | Purpose |
|---------|------|---------|
| `actions` | `shared/actions` | Shared actions and state management |
| `components` | `shared/components` | Reusable UI components |
| `img` | `shared/img` | Shared images and assets |
| `middlewares` | `shared/middlewares` | Common middleware functions |
| `styles` | `shared/styles` | Shared styling and themes |
| `testConfig` | `shared/testConfig` | Testing configurations and utilities |
| `types` | `shared/types` | Shared TypeScript types and interfaces |

### Running Specific Applications

To run any of these applications, use the project name in the nx commands:

```bash
# Examples
yarn nx run dashboard:dev        # Run dashboard in development mode
yarn nx run registration:dev     # Run registration in development mode
yarn nx run reporting:dev        # Run reporting in development mode
yarn nx run administration:dev   # Run administration in development mode
yarn nx run coam:dev            # Run COAM in development mode
```

### Working with Shared Libraries

The shared libraries are automatically available to all applications in the monorepo. When making changes to shared libraries, all dependent applications will be automatically rebuilt.

## Running the Application

### Development Mode

1. **Start the administration app**
   ```bash
   yarn admin
   ```
   This will start the app on port 4001

2. **Start the COAM app**
   ```bash
   yarn coam
   ```
   This will start the app on port 7000

### Testing

1. **Run unit tests**
   ```bash
   yarn admin:test      # For administration app tests
   yarn coam:test       # For COAM app tests
   yarn components:test # For shared components tests
   yarn utils:test      # For utilities tests
   ```

2. **Run E2E tests**
   ```bash
   yarn admin:e2e      # For administration app E2E tests
   yarn coam:e2e       # For COAM app E2E tests
   ```

3. **Run E2E tests with UI**
   ```bash
   yarn admin:e2e:ui   # For administration app E2E tests with UI
   yarn coam:e2e:ui    # For COAM app E2E tests with UI
   ```

### Building for Production

1. **Build the administration app**
   ```bash
   yarn admin:build
   ```

2. **Build the COAM app**
   ```bash
   yarn coam:build
   ```

## Running the Project Locally

### Prerequisites
- Node.js 20.11.0 (managed by asdf)
- Yarn (via Node's Corepack)
- Nx CLI (installed via project dependencies)

### Running Commands
The project uses Nx as a build system. You can run commands in two ways:

1. Using project dependencies (recommended):
   ```bash
   yarn nx run {project}:{target}
   ```
   
2. Using direct nx commands (if installed globally):
   ```bash
   nx {target} {project}
   ```

### Common Commands

| Command Purpose | Command to Run |
|----------------|----------------|
| Development server | `yarn nx run {project}:dev` |
| Build project | `yarn nx run {project}:build` |
| Start production server | `yarn nx run {project}:start` |
| Run tests | `yarn nx run {project}:test` |
| Run E2E tests | `yarn nx run {project}:e2e` |
| Run E2E tests with UI | `yarn nx run {project}:e2e:ui` |
| Format code check | `yarn nx format:check` |
| Format code write | `yarn nx format:write` |

### Examples for Specific Projects

For the administration app:
```bash
yarn nx run administration:dev    # Start development server
yarn nx run administration:build  # Build the app
yarn nx run administration:test   # Run tests
```

For the COAM app:
```bash
yarn nx run coam:dev    # Start development server
yarn nx run coam:build  # Build the app
yarn nx run coam:test   # Run tests
```

### Additional Features

- Run multiple projects in parallel:
  ```bash
  yarn nx run-many --target=test
  ```

- Format specific projects:
  ```bash
  yarn nx format:check --projects project1,project2
  yarn nx format:write --projects project1,project2
  ```

## Troubleshooting

### Common Issues

1. **Node.js version mismatch**
   - Verify your Node.js version:
     ```bash
     node --version
     ```
   - Should output: v20.11.0

2. **Yarn issues**
   - Clear yarn cache:
     ```bash
     yarn cache clean
     ```
   - Remove node_modules and reinstall:
     ```bash
     rm -rf node_modules
     yarn install
     ```

3. **Port conflicts**
   - Check if ports 4001 or 7000 are already in use:
     ```bash
     lsof -i :4001
     lsof -i :7000
     ```

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/v20.11.0/api/)
- [Yarn Documentation](https://yarnpkg.com/getting-started)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)

---
*Last updated: January 28, 2025*
