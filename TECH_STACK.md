# CAS Registration Project Technology Stack

## Project Structure

The project is divided into two main components:

### Frontend (bciers/)
The frontend application is built using modern web technologies and is organized as a monorepo using Nx.

Directory structure:
- `apps/` - Contains the main application code
- `libs/` - Shared libraries and components
- `.env` - Environment configuration
- `docker-compose-*.yaml` - Docker compose configurations for different environments

### Backend (bc_obps/)
The backend is a Python-based application built with Django, featuring multiple services and modules.

Directory structure:
- `bc_obps/` - Core application code
- `common/` - Shared utilities and components
- `registration/` - Registration service
- `reporting/` - Reporting service
- `rls/` - Row Level Security implementation
- `service/` - Main service layer

## Technology Stack

### Frontend Technologies
- **Framework**: 
  - Next.js (React-based framework)
  - React

- **Build & Development**:
  - Nx (Monorepo management)
  - Node.js
  - Yarn (Package management)
  - TypeScript
  - Babel (JavaScript compiler)

- **Testing & Quality**:
  - Playwright (E2E testing)
  - ESLint (Code linting)
  - Prettier (Code formatting)
  - Happo (Visual regression testing)
  - Vitest (Unit testing)

- **Styling**:
  - TailwindCSS
  - PostCSS

### Backend Technologies
- **Framework**:
  - Django (Python web framework)
  - Python

- **Development & Build**:
  - Poetry (Python dependency management)
  - Make (Build automation)

- **Testing & Quality**:
  - Pytest (Testing framework)
  - Coverage.py (Code coverage)
  - Bandit (Security linting)
  - MyPy (Static type checking)

### Infrastructure & DevOps
- **Containerization**:
  - Docker
  - Docker Compose

- **Version Control**:
  - Git
  - GitHub Actions (CI/CD)
  - Pre-commit hooks
  - Commitlint

- **Code Quality**:
  - SonarCloud (Code quality analysis)
  - Gitleaks (Secret scanning)

### Environment & Configuration
- Multiple environment configurations (.env files)
- VSCode configuration and workspace settings
- Environment-specific Docker compositions

## Development Tools
- `.tool-versions` - Version management for development tools
- `.vscode/` - VSCode editor configurations
- Various linting and formatting configurations for consistent code style

---
*Last updated: January 28, 2025*
