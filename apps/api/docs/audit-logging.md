# Audit Logging System

## Overview

This document describes the comprehensive audit logging system implemented for tracking sensitive payroll operations.

## Purpose

The audit logging system addresses critical security and compliance requirements:

- **Security Auditing**: Track who accessed sensitive financial data and when
- **Compliance**: Maintain records for regulatory requirements
- **Forensics**: Enable investigation of unauthorized access or data breaches
- **Accountability**: Ensure all payroll exports and modifications are traceable

## Database Schema

### `audit_log` Table

```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),  -- Supports IPv6
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Indexes

- `idx_audit_log_user` - Fast lookup by user
- `idx_audit_log_action_type` - Fast filtering by action type
- `idx_audit_log_created_at` - Time-based queries and reporting
- `idx_audit_log_metadata` - GIN index for JSONB queries

## Action Types

### Current Actions

- **`PAYROLL_EXPORT`**: Santander transfer Excel export

### Future Actions (Recommended)

- `BANKING_INFO_CREATED`: New banking information added
- `BANKING_INFO_UPDATED`: Banking information modified
- `BANKING_INFO_DELETED`: Banking information removed
- `LARGE_TRANSACTION`: Transactions above a certain threshold
- `ACCOUNT_CREATED`: New payroll account created
- `SENSITIVE_DATA_ACCESS`: Access to sensitive employee data

## Audit Log Entry Example

### Payroll Export

```json
{
  "id": 42,
  "user_id": 5,
  "action_type": "PAYROLL_EXPORT",
  "action_description": "Exported Santander transfer Excel with 25 employees, total amount: CLP 15,240,000",
  "metadata": {
    "export_type": "santander_transfer",
    "employee_count": 25,
    "total_amount": 15240000,
    "personnel_ids": [1, 2, 3, ...],
    "timestamp": "2025-12-22T05:01:00.000Z"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "created_at": "2025-12-22T05:01:00.123Z"
}
```

## Usage

### Service Layer

```typescript
// In PayrollService
await this.repository.createAuditLog({
    user_id: userId,
    action_type: 'PAYROLL_EXPORT',
    action_description: 'Exported payroll data',
    metadata: {
        employee_count: 25,
        total_amount: 15240000
    },
    ip_address: ipAddress,
    user_agent: userAgent
});
```

### Controller Layer

```typescript
// Extract context from request
const excelBuffer = await this.payrollService.generateSantanderTransferExcel({
    userId: req.user?.id,
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent')
});
```

## Querying Audit Logs

### Find all exports by a user

```sql
SELECT * FROM audit_log
WHERE user_id = $1 AND action_type = 'PAYROLL_EXPORT'
ORDER BY created_at DESC;
```

### Find all actions in a time range

```sql
SELECT * FROM audit_log
WHERE created_at BETWEEN $1 AND $2
ORDER BY created_at DESC;
```

### Find exports over a certain amount

```sql
SELECT * FROM audit_log
WHERE action_type = 'PAYROLL_EXPORT'
  AND (metadata->>'total_amount')::numeric > 10000000
ORDER BY created_at DESC;
```

### Find actions by IP address

```sql
SELECT 
    u.username,
    al.action_type,
    al.action_description,
    al.created_at
FROM audit_log al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.ip_address = $1
ORDER BY al.created_at DESC;
```

## Best Practices

### What to Log

✅ **DO log:**
- User ID (who did it)
- Action type (what they did)
- Timestamp (when - automatic via `created_at`)
- IP address (from where)
- User agent (which client)
- Relevant metadata (details)

❌ **DON'T log:**
- Sensitive data like passwords or full bank account details
- Personally identifiable information beyond what's necessary
- Data that could be used maliciously if the audit log is compromised

### Metadata Guidelines

Store structured data that helps with:
- **Investigation**: Record IDs, counts, amounts
- **Analysis**: Aggregatable metrics
- **Context**: Related entity IDs

Example metadata structure:
```typescript
metadata: {
    export_type: 'santander_transfer',
    employee_count: 25,
    total_amount: 15240000,
    personnel_ids: [1, 2, 3], // For detailed investigation
    timestamp: new Date().toISOString() // Operation timestamp
}
```

## Compliance & Retention

### Recommendations

1. **Retention Period**: Keep audit logs for at least 7 years (common financial regulation requirement)
2. **Backup**: Include audit logs in regular database backups
3. **Access Control**: Restrict access to audit logs to administrators only
4. **Alerts**: Consider implementing alerts for suspicious patterns:
   - Multiple exports in short time
   - Exports from unusual IP addresses
   - Large export volumes

### Monitoring Queries

```sql
-- Unusual activity: Multiple exports by same user in 24 hours
SELECT 
    user_id,
    COUNT(*) as export_count,
    SUM((metadata->>'total_amount')::numeric) as total_exported
FROM audit_log
WHERE action_type = 'PAYROLL_EXPORT'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 5;
```

## Future Enhancements

### Recommended Additions

1. **Export Endpoint**: Create `/api/audit-logs` endpoint for viewing logs
2. **Dashboard**: Build a UI for compliance officers to review audit trail
3. **Alerts**: Real-time notifications for suspicious activity
4. **Export**: Allow exporting audit logs for external compliance systems
5. **Data Minimization**: Add automatic anonymization for old logs

### Additional Actions to Log

Consider logging:
- Bulk banking info imports
- Payroll account modifications
- Failed authentication attempts on payroll endpoints
- Changes to source account configuration
- Manual balance adjustments

## Migration

The audit log table is created via migration:
- **File**: `1766220424732_create_audit_log.js`
- **Run with**: `npm run migrate up`
- **Rollback**: `npm run migrate down` (will remove audit_log table)

## Related Files

- Migration: `/apps/api/src/data/migrations/1766220424732_create_audit_log.js`
- Repository: `/apps/api/src/data/repositories/PayrollRepository.ts`
- Service: `/apps/api/src/services/PayrollService.ts`
- Controller: `/apps/api/src/api/controllers/payroll.controller.ts`
