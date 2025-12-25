# Personnel Table Design - Single Person per RUT

## Overview

The `personnel` table serves as the **single source of truth** for all employees in the system. It enforces a fundamental business rule: **one person = one RUT = one record**.

## Design Rationale

### Why Unique RUT Constraint?

The RUT (Rol Único Tributario) is Chile's national identification number, similar to a Social Security Number in the US. Key characteristics:

1. **Permanent**: A person's RUT never changes
2. **Unique**: Each person has exactly one RUT
3. **Legal**: Used for all legal, tax, and financial transactions
4. **Banking**: Bank accounts are tied to a person's RUT, not their job role

### Business Logic

```
Person → Has one RUT
      → Has one payroll account
      → Has one banking info record
      → May have multiple jobs/roles (but that's tracked elsewhere)
```

## Schema Design

```sql
CREATE TABLE personnel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rut VARCHAR(15) NOT NULL UNIQUE,  -- ← Enforces one person per RUT
    role VARCHAR(50) NOT NULL,         -- Primary role only
    conductor_id INTEGER REFERENCES conductor,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Current Implementation

### Single Role per Person

**Current Behavior**:
- Each person has ONE `role` field
- The role represents their **primary** or **most relevant** role
- Examples: "Conductor", "Peoneta", "Ayudante", "Administrative Staff"

**Limitation**:
- If someone works as both a Conductor and a Peoneta, you must choose which is their primary role
- The system treats them as a single employee with a single payroll account

### Advantages of Current Design

✅ **Simplicity**: Straightforward payroll calculations  
✅ **Tax Compliance**: One person = one tax record  
✅ **Banking**: One person = one bank account for transfers  
✅ **Payroll**: Single payroll account per person  
✅ **Data Integrity**: Cannot accidentally create duplicate personnel  

### Use Cases Handled Well

1. **Standard Operations**
   - Conductor works as a conductor → role: "Conductor"
   - Assistant works as assistant → role: "Peoneta"
   - Office staff → role: "Administrative"

2. **Role Changes**
   - Person promoted from Peoneta to Conductor
   - Update their `role` field: `UPDATE personnel SET role = 'Conductor' WHERE id = 5`
   - Payroll account and banking info remain unchanged ✅

3. **Rehiring**
   - Person leaves (set `is_active = false`)
   - Person returns (set `is_active = true`)
   - All payroll history preserved ✅

## Edge Cases & Limitations

### Case 1: Person with Multiple Concurrent Roles

**Scenario**: Juan works as both a Conductor AND a Peoneta on different days.

**Current Solution**:
- Choose his **primary** role (e.g., "Conductor")
- Store as: `role = 'Conductor'`
- All payments go to one payroll account
- Track work assignments separately in the OT (work order) system

**Limitation**: 
- Cannot separately track hours/payments by role
- Role history is lost when role is updated

### Case 2: Attempting to Add Duplicate RUT

**Scenario**: A conductor exists, and someone tries to manually add the same person as "Peoneta".

**Current Behavior**:
```sql
INSERT INTO personnel (rut, name, role) 
VALUES ('12345678-9', 'Juan Perez', 'Peoneta');
-- ERROR: duplicate key value violates unique constraint "personnel_rut_key"
```

**Correct Approach**:
```sql
-- Check if person already exists
SELECT * FROM personnel WHERE rut = '12345678-9';
-- If exists, update their role instead
UPDATE personnel SET role = 'Peoneta' WHERE rut = '12345678-9';
```

## Migration Behavior

### Initial Population from Conductors

The migration safely populates personnel from the conductor table:

```sql
INSERT INTO personnel (name, rut, role, conductor_id, is_active, created_at)
SELECT 
    c.name,
    c.rut,
    'Conductor' as role,
    c.id as conductor_id,
    true as is_active,
    c.created_at
FROM conductor c
WHERE NOT EXISTS (
    SELECT 1 FROM personnel p WHERE p.rut = c.rut
);
```

**Key Points**:
- ✅ `NOT EXISTS` prevents duplicate RUT violations
- ✅ Migration is **idempotent** (can be run multiple times safely)
- ✅ If someone manually added a personnel record first, conductors won't overwrite it

## Future Enhancement: Multi-Role Support

If the business requires tracking multiple concurrent roles per person, consider this approach:

### Option A: Role Junction Table (Recommended)

```sql
-- Keep personnel table as-is (one person = one record)
CREATE TABLE personnel_roles (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER NOT NULL REFERENCES personnel(id),
    role VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(personnel_id, role, valid_from)
);
```

**Benefits**:
- ✅ Maintains one person = one RUT = one payroll account
- ✅ Tracks role history
- ✅ Supports concurrent multiple roles
- ✅ Can track time periods for each role

**Usage Example**:
```sql
-- Juan is primarily a Conductor but also works as Peoneta
INSERT INTO personnel_roles (personnel_id, role, is_primary, valid_from)
VALUES 
    (5, 'Conductor', true, '2024-01-01'),
    (5, 'Peoneta', false, '2024-01-01');
```

### Option B: Store Roles as JSON Array

```sql
ALTER TABLE personnel 
ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;

-- Example data:
-- roles: ["Conductor", "Peoneta"]
-- primary_role: "Conductor"
```

**Benefits**:
- ✅ Simple implementation
- ✅ Flexible

**Drawbacks**:
- ❌ Harder to query
- ❌ No referential integrity
- ❌ No role history

## API Guidelines

### Creating Personnel

```typescript
// ✅ Correct: Check for existing RUT first
const existing = await db.query(
    'SELECT id FROM personnel WHERE rut = $1',
    [rut]
);

if (existing.rows.length > 0) {
    throw new ConflictError(
        'Person with this RUT already exists',
        'DUPLICATE_RUT'
    );
}

// Create new personnel
await db.query(
    'INSERT INTO personnel (name, rut, role) VALUES ($1, $2, $3)',
    [name, rut, role]
);
```

### Updating Role

```typescript
// ✅ Correct: Update existing person's role
await db.query(
    'UPDATE personnel SET role = $1 WHERE id = $2',
    [newRole, personnelId]
);

// ❌ WRONG: Don't create a new record with same RUT
await db.query(
    'INSERT INTO personnel (name, rut, role) VALUES ($1, $2, $3)',
    [name, existingRut, newRole]  // Will violate unique constraint!
);
```

## Querying Personnel

### Find by RUT
```sql
SELECT * FROM personnel 
WHERE rut = '12345678-9';
```

### Find Active Conductors
```sql
SELECT p.*, c.* 
FROM personnel p
JOIN conductor c ON p.conductor_id = c.id
WHERE p.role = 'Conductor' 
  AND p.is_active = true;
```

### Count by Role
```sql
SELECT role, COUNT(*) as count
FROM personnel
WHERE is_active = true
GROUP BY role;
```

## Data Integrity Rules

### Enforced by Database

1. ✅ **Unique RUT**: One person cannot have multiple personnel records
2. ✅ **Not Null**: RUT, name, and role are required
3. ✅ **Foreign Key**: conductor_id must reference valid conductor (or be NULL)
4. ✅ **CHECK Constraint**: banking_info.rut must match personnel.rut

### Enforced by Application

1. ✅ **RUT Format**: Must match Chilean RUT format (XXXXXXXX-Y)
2. ✅ **Valid Roles**: Should validate against allowed role list
3. ✅ **Conflict Detection**: Check for existing RUT before INSERT

## Troubleshooting

### Error: Duplicate Key Violation

```
ERROR: duplicate key value violates unique constraint "personnel_rut_key"
DETAIL: Key (rut)=(12345678-9) already exists.
```

**Solution**: The person already exists. Use UPDATE instead of INSERT, or check for existence first.

### Error: Cannot Add Conductor as Peoneta

**Problem**: Trying to add a conductor with a different role.

**Solution**: 
1. If changing roles: `UPDATE personnel SET role = 'Peoneta' WHERE rut = '12345678-9'`
2. If tracking multiple roles: Implement the personnel_roles junction table (future enhancement)

## Related Files

- Migration: `/apps/api/src/data/migrations/1766220424731_payroll_module.js`
- This document: `/apps/api/docs/personnel-table-design.md`

## Decision Log

**Date**: 2024-12-20  
**Decision**: Use UNIQUE constraint on RUT to enforce one-person-per-record  
**Rationale**: Aligns with Chilean tax/banking requirements, simplifies payroll  
**Trade-offs**: Cannot track multiple concurrent roles (acceptable for MVP)  
**Future**: Add personnel_roles junction table if multi-role tracking is needed
