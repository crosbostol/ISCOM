# HTTP Status Code Guidelines

## Overview

This document defines the proper HTTP status codes to use throughout the API for consistent and semantic error handling.

## Standard Success Codes

- **200 OK**: Successful GET, PUT, PATCH, DELETE requests
- **201 Created**: Successful POST request that creates a new resource
- **204 No Content**: Successful DELETE request with no response body

## Client Error Codes (4xx)

### 400 Bad Request
**When to use**: Request contains invalid data or fails validation

**Example scenarios**:
- Invalid JSON syntax
- Missing required fields
- Data fails Zod schema validation
- Business rule validation (e.g., negative amount for credit transactions)

**Error class**: `ValidationError`, `BadRequestError`

```typescript
throw new ValidationError('Amount must be positive', 'INVALID_AMOUNT');
```

### 401 Unauthorized
**When to use**: Authentication is required but missing or invalid

**Example scenarios**:
- No authentication token provided
- Invalid or expired JWT token
- Token signature verification failed

**Error class**: `UnauthorizedError`

```typescript
throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
```

### 403 Forbidden
**When to use**: User is authenticated but lacks permissions

**Example scenarios**:
- User trying to access manager-only endpoints
- User trying to modify another user's resources
- Insufficient role or privileges

**Error class**: `ForbiddenError`

```typescript
throw new ForbiddenError('Insufficient privileges', 'INSUFFICIENT_PRIVILEGES');
```

### 404 Not Found
**When to use**: Requested resource doesn't exist

**Example scenarios**:
- Employee ID not found in database
- Banking info doesn't exist for personnel
- Payroll account doesn't exist

**Error class**: `NotFoundError`

```typescript
throw new NotFoundError('Personnel not found', 'PERSONNEL_NOT_FOUND');
```

### 409 Conflict
**When to use**: Request conflicts with current state of the resource

**Example scenarios**:
- Creating a resource that already exists
- Duplicate unique constraint violation
- State conflict (e.g., trying to activate an already active record)

**Error class**: `ConflictError`

```typescript
throw new ConflictError('Banking info already exists', 'BANKING_INFO_EXISTS');
```

**Important**: Always return **409**, NOT 400, for ConflictError!

## Server Error Codes (5xx)

### 500 Internal Server Error
**When to use**: Unexpected server errors or configuration issues

**Example scenarios**:
- Database connection failures
- Missing environment variables (configuration errors)
- Unhandled exceptions

**Error class**: `ConfigurationError`, `AppError`

```typescript
throw new ConfigurationError('Missing SANTANDER_SOURCE_ACCOUNT', 'MISSING_CONFIG');
```

## Error Handling Patterns

### Controller Pattern

```typescript
async createBankingInfo(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await this.service.createBankingInfo(data);
        res.status(201).json(result);
    } catch (error) {
        // Handle specific errors with appropriate status codes
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else if (error instanceof ConflictError) {
            res.status(409).json({ error: error.message }); // ✅ Correct!
        } else {
            next(error); // Unhandled errors go to error middleware
        }
    }
}
```

### ❌ WRONG - Common Mistakes

```typescript
// DON'T DO THIS - ConflictError should be 409, not 400
if (error instanceof ConflictError) {
    res.status(400).json({ error: error.message }); // ❌ WRONG!
}

// DON'T DO THIS - NotFoundError should be 404, not 400
if (error instanceof NotFoundError) {
    res.status(400).json({ error: error.message }); // ❌ WRONG!
}
```

### ✅ CORRECT

```typescript
// Semantic and standards-compliant
if (error instanceof ConflictError) {
    res.status(409).json({ error: error.message }); // ✅ Correct!
}

if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message }); // ✅ Correct!
}
```

## Swagger Documentation

Always document all possible response codes in Swagger:

```typescript
/**
 * @swagger
 * /payroll/bank-info:
 *   post:
 *     responses:
 *       201:
 *         description: Banking info created
 *       400:
 *         description: Validation error (e.g., RUT mismatch)
 *       404:
 *         description: Personnel not found
 *       409:
 *         description: Banking info already exists (use PUT to update)
 */
```

## Quick Reference Table

| Error Class | Status Code | Use Case |
|------------|-------------|----------|
| `ValidationError` | 400 | Invalid input data |
| `BadRequestError` | 400 | General bad request |
| `UnauthorizedError` | 401 | Missing/invalid auth |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource doesn't exist |
| `ConflictError` | 409 | Resource already exists |
| `ConfigurationError` | 500 | Server misconfiguration |
| `AppError` | varies | Base class (specify code) |

## Testing Status Codes

Always verify the correct status codes in your tests:

```typescript
// Create duplicate banking info - should return 409
const response = await request(app)
    .post('/api/payroll/bank-info')
    .send(bankingInfoData);

expect(response.status).toBe(409); // ✅ Expecting conflict
expect(response.body.error).toContain('already exists');
```

## Best Practices

1. **Be Semantic**: Use status codes that accurately describe the situation
2. **Be Consistent**: Same error type = same status code across all endpoints
3. **Be Specific**: Include error codes in responses for programmatic handling
4. **Document**: Always update Swagger docs when adding new error responses
5. **Test**: Write tests to verify correct status codes are returned

## Related Files

- Error definitions: `/apps/api/src/utils/AppError.ts`
- Controller examples: `/apps/api/src/api/controllers/payroll.controller.ts`
- This guide: `/apps/api/docs/http-status-codes.md`
