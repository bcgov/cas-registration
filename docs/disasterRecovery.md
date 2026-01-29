# Disaster Recovery Guide

Complete guide for restoring the BCIERS application and PostgreSQL database from Google Cloud Storage backups.

## Quick Start

### Full Automated Recovery

```bash
# Option 1: Restore to most recent transaction (recommended)
make dr_full \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev \
  BACKUP_BUCKET={backup-bucket-name} \
  DB_PASSWORD='your-password' \
  RESTORE_TYPE=immediate

# Option 2: Restore to specific point in time
make dr_full \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev \
  BACKUP_BUCKET={backup-bucket-name} \
  DB_PASSWORD='your-password' \
  RESTORE_TYPE=time \
  RESTORE_TARGET='2026-01-13 14:30:00'
```

**Time**: 15-45 minutes depending on backup size and WAL replay.

## Prerequisites

### Required Tools

- `oc` CLI (OpenShift)
- `helm`
- `make`
- `gsutil` (optional, for backup verification)

### Required Secret

Create GCS credentials secret:

```bash
make generate_credentials service_account=YOUR_SERVICE_ACCOUNT
```

Or manually:

```bash
oc create secret generic gcs-backup-credentials \
  --from-file=credentials.json=path/to/key.json \
  -n <namespace>
```

> Note (testing): for quick testing or validation you can use a GCS service account with the Storage Object Viewer (read-only) role to create the `gcs-backup-credentials` secret. This is enough to deploy the application and to read/verify backup objects in the bucket, but such a read-only account cannot upload/create backups — after deployment the app will not be able to write backups unless the service account has write permissions (Storage Object Creator / Storage Admin) for the target bucket.

> Note (separate buckets / custom backup config): if you want backups stored in separate buckets or require a different pgBackRest configuration, configure the desired bucket or pgBackRest settings when running the restore/deploy targets (for example by setting the `BACKUP_BUCKET` environment variable used by `dr_restore`/`dr_full`, or by updating your pgBackRest config). See the Makefile targets (`dr_full`, `dr_restore`) for where `BACKUP_BUCKET` is used.

## Restore Types

### Immediate (Recommended)

Restores to the most recent committed transaction.

```bash
RESTORE_TYPE=immediate
```

**Use when**: You need maximum data recovery with minimal data loss.

**Requirements**: WAL archives must be available.

**Recovery point**: Last committed transaction before the incident.

### Point-in-Time Recovery (PITR)

Restores to a specific timestamp.

```bash
RESTORE_TYPE=time
RESTORE_TARGET='2026-01-13 14:30:00'
```

**Use when**: You know exactly when data corruption or an incident occurred.

**Requirements**:

- WAL archives must be available up to target time
- Target must be after backup start time
- Format: `YYYY-MM-DD HH:MM:SS`

**Recovery point**: Exactly at the specified timestamp.

## Step-by-Step Process

### 1. Verify Backup Exists

Always verify before restoring:

```bash
make dr_verify_backup \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev \
  BACKUP_BUCKET={backup-bucket-name} \
  RESTORE_TYPE=immediate
```

**What it checks**:

- GCS credentials are valid
- Backup bucket is accessible
- Lists available backups (Full/Incremental/Differential)
- Verifies WAL archives for immediate/time restores

### 2. Restore Database

```bash
# For immediate restore
make dr_restore \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev \
  BACKUP_BUCKET={backup-bucket-name} \
  RESTORE_TYPE=immediate

# For point-in-time restore
make dr_restore \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev \
  BACKUP_BUCKET={backup-bucket-name} \
  RESTORE_TYPE=time \
  RESTORE_TARGET='2026-01-13 14:30:00'
```

Monitor progress:

```bash
make dr_monitor_restore OBPS_NAMESPACE_PREFIX={namespace-prefix} ENVIRONMENT=dev
```

### 3. Finalize Restore

After restore completes:

```bash
make dr_finalize_restore \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev
```

### 4. Setup Database Users

```bash
make dr_setup_db \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev \
  DB_PASSWORD='your-password'
```

### 5. Verify Database

```bash
make dr_verify_db \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev
```

### 6. Deploy Application

Before deploying the application: if the Airflow endpoint/environment is not configured for the namespace you are restoring into, set the DAG download flags to false in your local Helm values file (for example `helm/cas-bciers/values-<env>.yaml`) before you run the deploy.

Example entries to set in your `values.yaml`:

```yaml
download-dags:
  enabled: false

download-migration-test-dags:
  enabled: false
```

After updating your local values file, run the deploy step below:

```bash
make dr_deploy_app \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev
```

### 7. Run Tests

```bash
make dr_test \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev
```

## Understanding Backup Types

**Full Backup (F)**: Complete database copy, can restore independently.
Example: `20250113-143022F`

**Incremental Backup (I)**: Changes since last backup, requires full backup + all preceding incrementals.
Example: `20250113-150045I`

**Differential Backup (D)**: Changes since last full backup, requires only the full backup.
Example: `20250113-160030D`

## Monitoring & Status

```bash
# Overall status
make dr_status OBPS_NAMESPACE_PREFIX={namespace-prefix} ENVIRONMENT=dev

# Check restore logs
make dr_check_restore_logs OBPS_NAMESPACE_PREFIX={namespace-prefix} ENVIRONMENT=dev

# Check backend
make dr_check_backend OBPS_NAMESPACE_PREFIX={namespace-prefix} ENVIRONMENT=dev
```

## Common Issues

### No backups found

**Solution**: Verify bucket name and path structure:

```bash
gsutil ls gs://your-bucket/pgbackrest/repo1/backup/db/
```

### WAL archives not available

**Error**: "No WAL timeline directories found"

**Solution**:

1. Check WAL archive path: `gs://bucket/pgbackrest/repo1/archive/db/`
2. Verify WAL archiving is enabled on source database
3. Use `RESTORE_TYPE=immediate` only if WAL archives exist

### Restore pod pending

**Solution**:

```bash
# Check PVC status
oc get pvc -n <namespace> | grep obps

# Check events
oc get events -n <namespace> --sort-by='.lastTimestamp' | tail -20
```

### Database pod restarting

**Solution**:

```bash
# Check database logs
oc logs obps-instance1-<hash>-0 -c database -n <namespace> --tail=100

# Check restore completion
make dr_check_restore_logs OBPS_NAMESPACE_PREFIX={namespace-prefix} ENVIRONMENT=dev
```

### Backend not ready

**Solution**:

```bash
# Check backend logs
make dr_check_backend OBPS_NAMESPACE_PREFIX={namespace-prefix} ENVIRONMENT=dev

# Verify database connectivity
oc exec <backend-pod> -n <namespace> -- \
  nc -zv obps-primary.<namespace>.svc.cluster.local 5432
```

## Cleanup

```bash
# Delete everything
helm uninstall cas-bciers -n <namespace>

make dr_cleanup \
  OBPS_NAMESPACE_PREFIX={namespace-prefix} \
  ENVIRONMENT=dev
```

## Production Checklist

**Before Recovery**:

- [ ] Run `dr_verify_backup` to confirm backups exist
- [ ] Verify WAL archives available (for immediate/time restore)
- [ ] Test in dev/test environment first
- [ ] Document database password
- [ ] Notify stakeholders
- [ ] Plan maintenance window

**After Recovery**:

- [ ] Verify database connectivity
- [ ] Check data integrity
- [ ] Test application functionality
- [ ] Review logs for errors
- [ ] Confirm backups continue working

## Recovery Times

| Component           | Time          | Notes                          |
| ------------------- | ------------- | ------------------------------ |
| Backup Verification | 1-2 min       | Checks credentials and backups |
| Database Restore    | 5-20 min      | Depends on backup size         |
| WAL Replay          | 2-10 min      | For immediate/time restores    |
| Database Setup      | 1-2 min       | Users and permissions          |
| App Deployment      | 5-15 min      | Helm deployment                |
| Testing             | 1-2 min       | Smoke tests                    |
| **Total**           | **15-45 min** | End-to-end                     |

## Key Makefile Targets

| Target                | Description                                |
| --------------------- | ------------------------------------------ |
| `dr_full`             | Complete automated recovery                |
| `dr_verify_backup`    | Verify backup exists and credentials valid |
| `dr_restore`          | Restore database from backup               |
| `dr_finalize_restore` | Remove dataSource after restore            |
| `dr_setup_db`         | Setup users and permissions                |
| `dr_verify_db`        | Verify database restoration                |
| `dr_deploy_app`       | Deploy application                         |
| `dr_test`             | Run smoke tests                            |
| `dr_status`           | Show resource status                       |
| `dr_cleanup`          | Delete cluster                             |

## Required Variables

| Variable                | Required | Default | Description                                   |
| ----------------------- | -------- | ------- | --------------------------------------------- |
| `OBPS_NAMESPACE_PREFIX` | Yes      | -       | Namespace prefix (e.g., `{namespace-prefix}`) |
| `ENVIRONMENT`           | Yes      | -       | Environment (`dev`, `test`, `prod`)           |
| `BACKUP_BUCKET`         | Yes      | -       | GCS bucket with backups                       |
| `DB_PASSWORD`           | Yes\*    | -       | Password for `obps` user                      |
| `RESTORE_TYPE`          | Yes      | -       | `immediate` or `time`                         |
| `RESTORE_TARGET`        | Yes\*\*  | -       | Timestamp for `RESTORE_TYPE=time`             |
| `DB_CLUSTER_NAME`       | No       | `obps`  | PostgreSQL cluster name                       |

\* Required for setup/deploy steps
\*\* Required only with `RESTORE_TYPE=time`

## Support

For issues during recovery:

1. Run `dr_verify_backup` first
2. Check troubleshooting section above
3. Review logs with `dr_status` and `dr_check_restore_logs`
4. Contact platform team with complete error messages and timeline
