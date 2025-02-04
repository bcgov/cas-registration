# Development Environment Setup Guide (Ubuntu)

## Prerequisites

The following development packages are required:

```bash
# Build essentials and core development tools
sudo apt-get install -y build-essential pkg-config

# ICU support
sudo apt-get install -y libicu-dev

# UUID support
sudo apt-get install -y uuid-dev

# Python development libraries
sudo apt-get install -y libbz2-dev libsqlite3-dev tk-dev liblzma-dev
```

## Installation Steps

1. Install development tools using make:
```bash
make install_dev_tools
```

This command will:
- Install Python 3.12.3 via asdf
- Install Poetry 1.8.1
- Install and configure PostgreSQL 16.2

2. Create PostgreSQL user:
```bash

Note: If you get a "role YourUserName does not exist" error, you might need to first create the YourUserName superuser:
```bash
psql -h localhost -p 5432 -c "CREATE USER YourUserName WITH SUPERUSER;"
```

## Common Issues and Solutions

### PostgreSQL Port Conflict
If you see an error about port 5432 being in use, you may need to stop the system PostgreSQL:
```bash
sudo systemctl stop postgresql
```

Then restart the asdf-managed PostgreSQL:
```bash
make start_pg
```

### PostgreSQL User Errors
If you see "role your_username does not exist" when running database commands, make sure you've completed step 2 of the Installation Steps to create your PostgreSQL user.

## Managing the Development Environment

### Virtual Environment

This project uses Poetry 1.8.1 managed by asdf. 
You can activate the virtual environment in two ways:

1. Using Poetry (recommended):
```bash
poetry shell
```

> **Note**: If you're using Poetry 2.0+, the `shell` command was removed. In that case, use these alternatives:
> ```bash
> # Run a single command
> poetry run python manage.py [command]
> 
> # Or start a new shell with the environment activated
> poetry run bash
> ```

2. Direct activation (alternative):
```bash
source $(poetry env info --path)/bin/activate
```

### PostgreSQL Management

- Start PostgreSQL:
```bash
make start_pg
```

- Stop PostgreSQL:
```bash
make stop_pg
```

## Verifying Installation

You can verify your installation by checking the versions of installed components:

```bash
# Check Python version
python --version  # Should show 3.12.3

# Check Poetry version
poetry --version  # Should show 1.8.1

# Check PostgreSQL version
psql --version   # Should show 16.2
```

## Post-Restart Steps

After system restart, you'll need to:
1. Start PostgreSQL: Either run `make start_pg` from inside the 
    cas-registration/bc_obps directory or 
    `make -C bc_obps start_pg` from the root (cas-registration/) directory
2. Activate the virtual environment:
    ```bash
    # Using Poetry 1.8.1 (via asdf)
    poetry shell

    # Or alternatively, activate directly:
    source $(poetry env info --path)/bin/activate
    ```
3. From inside the `cas-registration/bc_obps` directory, run `make run`. 
    This will start running the backend development server locally (default port is :8000; 
    terminal output will indicate what localhost address to use to access the backend server). 
    To test it out, navigate to the /api/docs endpoint in your browser
