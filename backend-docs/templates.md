Template Management
Overview
Template Management provides a centralized system for creating, managing, and applying pre-configured templates to tenant-specific data. Templates enable quick setup of standard configurations (Chart of Accounts, Tax rates, etc.) for new tenants or when standardizing existing tenant data.

Key Features:

Global Templates - Templates stored in public schema, accessible to all tenants
Template Types - Support for Chart of Accounts and Tax templates
Template Preview - Preview what will be created before applying
Template Application - Apply templates to tenant-specific schemas
Usage Tracking - Complete audit trail of template applications
Access Control - SuperAdmin manages templates, all users can view and apply
Active/Inactive Status - Enable/disable templates without deletion
Soft Delete - Restore deleted templates if needed
Use Cases:

Quick setup for new tenants with standard Chart of Accounts
Standardize tax configurations across tenants
Industry-specific templates (retail, manufacturing, services, etc.)
Compliance templates for different jurisdictions
Template versioning and updates
Flow
Template Creation Flow (SuperAdmin Only)

1. SuperAdmin provides template details (name, type, data)
   ↓
2. System validates:
    - Name is required and unique
    - Template type is valid (chart_of_accounts, tax)
    - Template data structure matches type
      ↓
3. Create template in public schema
   ↓
4. Set isActive = true (default)
   ↓
5. Return created template
   Template Application Flow
6. User selects template to apply
   ↓
7. System validates:
    - Template exists and is active
    - Template type matches target (COA or Tax)
    - User has tenant context
      ↓
8. Preview template (optional):
    - Show what will be created
    - Identify duplicates (will be skipped)
    - Display summary
      ↓
9. Apply template:
    - Create items from template data
    - Skip existing items (by number/name)
    - Record usage in template_usages table
      ↓
10. Return application result:
    - Created items
    - Skipped items (with reasons)
    - Failed items (with errors)
    - Overall status (success, partial, failed)
      Template Update Flow (SuperAdmin Only)
11. SuperAdmin provides updated template details
    ↓
12. System validates:
    - Template exists
    - Template data structure is valid
      ↓
13. Update template fields
    ↓
14. Return updated template
    Template Deletion Flow (SuperAdmin Only)
15. SuperAdmin requests template deletion
    ↓
16. System validates:
    - Template exists
      ↓
17. Soft delete template (set deleted_at)
    ↓
18. Template is hidden from queries but preserved
    ↓
19. Return deleted template
    Features Implemented
    ✅ Core Template Management
    Create Template - Create new templates (SuperAdmin only)
    List Templates - Paginated list with filtering and sorting (all authenticated users)
    Get Template - Retrieve template by ID (all authenticated users)
    Update Template - Modify template details (SuperAdmin only)
    Delete Template - Soft delete template (SuperAdmin only)
    Restore Template - Restore soft-deleted template (SuperAdmin only)
    ✅ Template Status Management
    Enable Template - Activate a template (set isActive = true) (SuperAdmin only)
    Disable Template - Deactivate a template (set isActive = false) (SuperAdmin only)
    Filter by Status - Filter templates by active/inactive status
    ✅ Template Application
    Preview Template - Preview what will be created without applying (Chart of Accounts and Tax)
    Apply Template - Create items from template in tenant schema (Chart of Accounts and Tax)
    Duplicate Handling - Automatically skip existing items instead of failing
    Result Tracking - Track created, skipped, and failed items
    ✅ Template Usage Tracking
    Usage History - Track all template applications
    Usage Status - Track status (pending, success, partial, failed)
    Result Data - Store detailed results (created items, errors, warnings)
    Audit Trail - Record who applied template, when, and to which tenant
    ✅ Template Types
    Chart of Accounts - Templates for standard account structures
    Tax - Templates for standard tax configurations
    ✅ Filtering & Search
    Filter by template type (chart_of_accounts, tax)
    Filter by active/inactive status
    Search by template name or description
    Sort by name, templateType, isActive, createdAt, updatedAt
    Database Schema
    Table: templates
    Location: Public schema

Columns:

Column Type Constraints Description
id UUID PRIMARY KEY Template unique identifier
name VARCHAR(255) NOT NULL Template name (e.g., "Standard Chart of Accounts")
description TEXT NULLABLE Template description
template_type VARCHAR(50) NOT NULL, UNIQUE Template type: chart_of_accounts or tax
template_data JSONB NOT NULL Template data (accounts or taxes array)
is_active BOOLEAN NOT NULL, DEFAULT true Whether the template is active
created_by UUID NOT NULL, FK → users.id User who created the template (SuperAdmin)
created_at TIMESTAMP NOT NULL, DEFAULT NOW() Template creation timestamp
updated_at TIMESTAMP NOT NULL, DEFAULT NOW() Template last update timestamp
deleted_at TIMESTAMP NULLABLE Soft delete timestamp
Indexes:

idx_templates_template_type on template_type
idx_templates_is_active on is_active
idx_templates_created_by on created_by
idx_templates_deleted_at on deleted_at
idx_templates_type_active_deleted on (template_type, is_active, deleted_at) - Composite index for finding active templates by type
idx_templates_active_deleted on (is_active, deleted_at) - Composite index for finding active templates
Unique Constraints:

templates_template_type_unique on template_type - Ensures one template per type (can be extended for multiple templates per type in future)
Foreign Keys:

fk_templates_created_by → users(id) ON DELETE RESTRICT
Relationships:

Creator: Many-to-one relationship (created_by → users.id)
Usages: One-to-many relationship (id → template_usages.template_id)
Table: template_usages
Location: Public schema

Columns:

Column Type Constraints Description
id UUID PRIMARY KEY Usage record unique identifier
template_id UUID NOT NULL, FK → templates.id Template that was applied
tenant_id UUID NOT NULL, FK → tenants.id Tenant the template was applied to
applied_by UUID NOT NULL, FK → users.id User who applied the template
status VARCHAR(50) NOT NULL Usage status: pending, success, partial, failed
result_data JSONB NULLABLE Detailed results (created items, skipped items, errors)
notes TEXT NULLABLE Additional notes about the application
applied_at TIMESTAMP NOT NULL, DEFAULT NOW() When the template was applied
created_at TIMESTAMP NOT NULL, DEFAULT NOW() Record creation timestamp
updated_at TIMESTAMP NOT NULL, DEFAULT NOW() Record last update timestamp
deleted_at TIMESTAMP NULLABLE Soft delete timestamp
Indexes:

idx_template_usages_template_id on template_id
idx_template_usages_tenant_id on tenant_id
idx_template_usages_applied_by on applied_by
idx_template_usages_status on status
idx_template_usages_applied_at on applied_at
idx_template_usages_deleted_at on deleted_at
idx_template_usages_tenant_template on (tenant_id, template_id) - Composite index for finding usages by tenant and template
Foreign Keys:

fk_template_usages_template → templates(id) ON DELETE RESTRICT
fk_template_usages_tenant → tenants(id) ON DELETE CASCADE
fk_template_usages_applied_by → users(id) ON DELETE RESTRICT
Relationships:

Template: Many-to-one relationship (template_id → templates.id)
Tenant: Many-to-one relationship (tenant_id → tenants.id)
Applied By User: Many-to-one relationship (applied_by → users.id)
Migration File:

src/database/migrations/20260102073633_create_templates_tables.ts
Architecture
Technology Stack
ORM: Objection.js with Knex query builder
Database: PostgreSQL with public schema for templates
Validation: Zod schemas for request validation
Routing: Express.js with TypeScript
Authentication: JWT-based authentication
Authorization: Role-based access control (SuperAdmin for management)
File Structure
src/
├── models/
│ ├── Template.ts # Template model with relations and modifiers
│ └── TemplateUsage.ts # TemplateUsage model for audit trail
├── types/
│ └── template.type.ts # TypeScript type definitions
├── schema/
│ └── template.schema.ts # Zod validation schemas
├── queries/
│ └── template.queries.ts # Database query functions
├── controllers/
│ └── template.controller.ts # HTTP request handlers
├── routes/
│ └── template.route.ts # Route definitions
└── database/
└── migrations/
└── 20260102073633_create_templates_tables.ts # Migration file
Design Patterns
Repository Pattern: Query functions in queries/ directory encapsulate database operations
MVC Pattern: Controllers handle HTTP requests, models represent data, routes define endpoints
Validation Pattern: Zod schemas validate all inputs before processing
Global Resource Pattern: Templates stored in public schema, accessible to all tenants
Soft Delete Pattern: Templates are soft-deleted (deleted_at) rather than hard-deleted
Audit Pattern: Template usage tracking provides complete audit trail
Model Structure
Template Model (src/models/Template.ts):

Extends BaseModel for UUID, timestamps, and soft delete support
Defines template types as enums (chart_of_accounts, tax)
Includes JSON schema for validation
Query modifiers: active, byType, byCreator
Relations: creator, usages
TemplateUsage Model (src/models/TemplateUsage.ts):

Extends BaseModel for UUID, timestamps, and soft delete support
Defines usage status as enum (pending, success, partial, failed)
Includes JSON schema for validation
Query modifiers: byTemplate, byTenant, byStatus, byAppliedBy
Relations: template, tenant, appliedByUser
Query Functions
Key Query Functions (src/queries/template.queries.ts):

findTemplates(): List templates with pagination, sorting, search, and filtering
findTemplateById(): Get template by ID
createTemplate(): Create new template (SuperAdmin only)
updateTemplate(): Update template (SuperAdmin only)
deleteTemplate(): Soft delete template (SuperAdmin only)
restoreTemplate(): Restore soft-deleted template (SuperAdmin only)
enableTemplate(): Activate template (SuperAdmin only)
disableTemplate(): Deactivate template (SuperAdmin only)
findTemplateUsages(): List template usages with filtering
findTemplateUsageById(): Get template usage by ID
Controller Functions
Key Controller Functions (src/controllers/template.controller.ts):

listTemplates(): List all templates (all authenticated users)
getTemplateById(): Get template by ID (all authenticated users)
createTemplateController(): Create new template (SuperAdmin only)
updateTemplateController(): Update template (SuperAdmin only)
deleteTemplateController(): Soft delete template (SuperAdmin only)
restoreTemplateController(): Restore template (SuperAdmin only)
enableTemplateController(): Activate template (SuperAdmin only)
disableTemplateController(): Deactivate template (SuperAdmin only)
listTemplateUsages(): List template usages (tenant-scoped)
getTemplateUsageById(): Get template usage by ID (tenant-scoped)
API Endpoints
Base URL
All endpoints are prefixed with /api/v1/templates

Authentication
All endpoints require authentication via JWT Bearer token in the Authorization header:

Authorization: Bearer <access_token>
Authorization
SuperAdmin Only: Create, update, delete, restore, enable, disable templates
All Authenticated Users: View templates, view template usages (tenant-scoped)
Endpoints

1. List Templates
   GET /templates

Retrieves all templates with pagination, sorting, search, and filtering. All authenticated users can access this endpoint.

Query Parameters:

Parameter Type Required Default Description
page integer No 1 Page number (minimum: 1)
limit integer No 20 Items per page (minimum: 1, maximum: 100)
sort string No createdAt Sort field: name, templateType, isActive, createdAt, updatedAt
order string No asc Sort order: asc or desc
search string No - Search term (searches name, description)
type string No - Filter by template type: chart_of_accounts, tax
isActive boolean No - Filter by active status
Request Example:

GET /api/v1/templates?page=1&limit=20&sort=name&order=asc&type=chart_of_accounts&isActive=true
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Templates retrieved successfully",
"data": {
"items": [
{
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Standard Chart of Accounts",
"description": "Standard chart of accounts for general business",
"templateType": "chart_of_accounts",
"templateData": {
"accounts": [
{
"accountNumber": "1000",
"accountName": "Cash",
"accountType": "asset",
"accountSubtype": "current_asset",
"openingBalance": 0,
"currencyCode": "CAD"
}
]
},
"isActive": true,
"createdAt": "2025-12-04T10:00:00.000Z",
"updatedAt": "2025-12-04T10:00:00.000Z"
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 1,
"totalPages": 1,
"hasNextPage": false,
"hasPreviousPage": false
}
}
}
Error Responses:

401 Unauthorized: User not authenticated 2. Get Template by ID
GET /templates/:id

Retrieves a specific template by ID. All authenticated users can access this endpoint.

Path Parameters:

Parameter Type Required Description
id UUID Yes Template ID
Request Example:

GET /api/v1/templates/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template retrieved successfully",
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Standard Chart of Accounts",
"description": "Standard chart of accounts for general business",
"templateType": "chart_of_accounts",
"templateData": {
"accounts": [...]
},
"isActive": true,
"createdAt": "2025-12-04T10:00:00.000Z",
"updatedAt": "2025-12-04T10:00:00.000Z"
}
}
Error Responses:

401 Unauthorized: User not authenticated
404 Not Found: Template not found 3. Create Template (SuperAdmin Only)
POST /templates

Creates a new template. Only SuperAdmin can create templates.

Request Body:

Field Type Required Description
name string Yes Template name (1-255 chars)
description string No Template description (max 1000 chars)
templateType enum Yes Template type: chart_of_accounts or tax
templateData object Yes Template data (JSON object with accounts or taxes array)
isActive boolean No Whether template is active (default: true)
Request Example:

POST /api/v1/templates
Authorization: Bearer <access_token>
Content-Type: application/json

{
"name": "Standard Chart of Accounts",
"description": "Standard chart of accounts for general business",
"templateType": "chart_of_accounts",
"templateData": {
"accounts": [
{
"accountNumber": "1000",
"accountName": "Cash",
"accountType": "asset",
"accountSubtype": "current_asset",
"openingBalance": 0,
"currencyCode": "CAD"
}
]
},
"isActive": true
}
Response Example (201 Created):

{
"success": true,
"statusCode": 201,
"message": "Template created successfully",
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Standard Chart of Accounts",
"description": "Standard chart of accounts for general business",
"templateType": "chart_of_accounts",
"isActive": true,
"createdAt": "2025-12-04T10:00:00.000Z",
"updatedAt": "2025-12-04T10:00:00.000Z"
}
}
Error Responses:

400 Bad Request: Validation error
401 Unauthorized: User not authenticated
403 Forbidden: User not authorized (SuperAdmin only) 4. Update Template (SuperAdmin Only)
PUT /templates/:id

Updates an existing template. Only SuperAdmin can update templates.

Path Parameters:

Parameter Type Required Description
id UUID Yes Template ID
Request Body:

All fields are optional. Only provided fields will be updated.

Field Type Required Description
name string No Template name (1-255 chars)
description string No Template description (max 1000 chars)
templateType enum No Template type: chart_of_accounts or tax
templateData object No Template data (JSON object)
isActive boolean No Whether template is active
Request Example:

PUT /api/v1/templates/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
Content-Type: application/json

{
"name": "Updated Standard Chart of Accounts",
"description": "Updated description",
"isActive": true
}
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template updated successfully",
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Updated Standard Chart of Accounts",
"description": "Updated description",
"templateType": "chart_of_accounts",
"isActive": true,
"createdAt": "2025-12-04T10:00:00.000Z",
"updatedAt": "2025-12-04T10:05:00.000Z"
}
}
Error Responses:

400 Bad Request: Validation error
401 Unauthorized: User not authenticated
403 Forbidden: User not authorized (SuperAdmin only)
404 Not Found: Template not found 5. Delete Template (SuperAdmin Only)
DELETE /templates/:id

Soft deletes a template. Only SuperAdmin can delete templates.

Path Parameters:

Parameter Type Required Description
id UUID Yes Template ID
Request Example:

DELETE /api/v1/templates/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template deleted successfully",
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Standard Chart of Accounts",
"deletedAt": "2025-12-04T10:10:00.000Z"
}
}
Error Responses:

401 Unauthorized: User not authenticated
403 Forbidden: User not authorized (SuperAdmin only)
404 Not Found: Template not found 6. Restore Template (SuperAdmin Only)
POST /templates/:id/restore

Restores a soft-deleted template. Only SuperAdmin can restore templates.

Path Parameters:

Parameter Type Required Description
id UUID Yes Template ID
Request Example:

POST /api/v1/templates/550e8400-e29b-41d4-a716-446655440000/restore
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template restored successfully",
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Standard Chart of Accounts",
"description": "Standard chart of accounts for general business",
"templateType": "chart_of_accounts",
"isActive": true,
"createdAt": "2025-12-04T10:00:00.000Z",
"updatedAt": "2025-12-04T10:15:00.000Z"
}
}
Error Responses:

401 Unauthorized: User not authenticated
403 Forbidden: User not authorized (SuperAdmin only)
404 Not Found: Template not found or not deleted 7. Enable Template (SuperAdmin Only)
POST /templates/:id/enable

Enables a template by setting isActive to true. Only SuperAdmin can enable templates.

Path Parameters:

Parameter Type Required Description
id UUID Yes Template ID
Request Example:

POST /api/v1/templates/550e8400-e29b-41d4-a716-446655440000/enable
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template enabled successfully",
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Standard Chart of Accounts",
"templateType": "chart_of_accounts",
"isActive": true,
"updatedAt": "2025-12-04T10:20:00.000Z"
}
}
Error Responses:

401 Unauthorized: User not authenticated
403 Forbidden: User not authorized (SuperAdmin only)
404 Not Found: Template not found 8. Disable Template (SuperAdmin Only)
POST /templates/:id/disable

Disables a template by setting isActive to false. Only SuperAdmin can disable templates.

Path Parameters:

Parameter Type Required Description
id UUID Yes Template ID
Request Example:

POST /api/v1/templates/550e8400-e29b-41d4-a716-446655440000/disable
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template disabled successfully",
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Standard Chart of Accounts",
"templateType": "chart_of_accounts",
"isActive": false,
"updatedAt": "2025-12-04T10:25:00.000Z"
}
}
Error Responses:

401 Unauthorized: User not authenticated
403 Forbidden: User not authorized (SuperAdmin only)
404 Not Found: Template not found 9. List Template Usages
GET /templates/usages

Retrieves template usage history. Regular users can view their tenant's usage history. SuperAdmin can view all usages.

Query Parameters:

Parameter Type Required Default Description
page integer No 1 Page number (minimum: 1)
limit integer No 20 Items per page (minimum: 1, maximum: 100)
sort string No appliedAt Sort field: appliedAt, status, createdAt
order string No desc Sort order: asc or desc
search string No - Search term (searches notes)
templateId UUID No - Filter by template ID
status string No - Filter by status: pending, success, partial, failed
Request Example:

GET /api/v1/templates/usages?page=1&limit=20&status=success
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template usages retrieved successfully",
"data": {
"items": [
{
"id": "660e8400-e29b-41d4-a716-446655440000",
"templateId": "550e8400-e29b-41d4-a716-446655440000",
"templateName": "Standard Chart of Accounts",
"status": "success",
"appliedAt": "2025-12-04T10:30:00.000Z",
"createdAt": "2025-12-04T10:30:00.000Z"
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 1,
"totalPages": 1,
"hasNextPage": false,
"hasPreviousPage": false
}
}
}
Error Responses:

401 Unauthorized: User not authenticated
403 Forbidden: Tenant context required 10. Get Template Usage by ID
GET /templates/usages/:id

Retrieves a specific template usage by ID. Regular users can view their tenant's usage history. SuperAdmin can view all usages.

Path Parameters:

Parameter Type Required Description
id UUID Yes Template usage ID
Request Example:

GET /api/v1/templates/usages/660e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
Response Example (200 OK):

{
"success": true,
"statusCode": 200,
"message": "Template usage retrieved successfully",
"data": {
"id": "660e8400-e29b-41d4-a716-446655440000",
"templateId": "550e8400-e29b-41d4-a716-446655440000",
"templateName": "Standard Chart of Accounts",
"templateType": "chart_of_accounts",
"status": "success",
"resultData": {
"created": 45,
"skipped": 5,
"failed": 0
},
"notes": "Template applied successfully",
"appliedAt": "2025-12-04T10:30:00.000Z",
"createdAt": "2025-12-04T10:30:00.000Z",
"updatedAt": "2025-12-04T10:30:00.000Z"
}
}
Error Responses:

401 Unauthorized: User not authenticated
403 Forbidden: Tenant context required
404 Not Found: Template usage not found
Code Examples
Frontend Integration
React/TypeScript Example
import axios from 'axios'

const API_BASE_URL = 'https://api.bkeep.ca/api/v1'
const accessToken = 'your-access-token'

// List templates
const listTemplates = async (filters?: {
page?: number
limit?: number
type?: 'chart_of_accounts' | 'tax'
isActive?: boolean
search?: string
}) => {
try {
const response = await axios.get(`${API_BASE_URL}/templates`, {
params: filters,
headers: {
Authorization: `Bearer ${accessToken}`,
},
})
return response.data.data
} catch (error) {
console.error('Error listing templates:', error)
throw error
}
}

// Get template by ID
const getTemplate = async (templateId: string) => {
try {
const response = await axios.get(
`${API_BASE_URL}/templates/${templateId}`,
{
headers: {
Authorization: `Bearer ${accessToken}`,
},
}
)
return response.data.data
} catch (error) {
console.error('Error getting template:', error)
throw error
}
}

// Create template (SuperAdmin only)
const createTemplate = async (templateData: {
name: string
description?: string
templateType: 'chart_of_accounts' | 'tax'
templateData: Record<string, unknown>
isActive?: boolean
}) => {
try {
const response = await axios.post(
`${API_BASE_URL}/templates`,
templateData,
{
headers: {
Authorization: `Bearer ${accessToken}`,
'Content-Type': 'application/json',
},
}
)
return response.data.data
} catch (error) {
console.error('Error creating template:', error)
throw error
}
}

// Preview template (Chart of Accounts)
const previewChartOfAccountsTemplate = async (templateId: string) => {
try {
const response = await axios.get(
`${API_BASE_URL}/accounts/template/${templateId}/preview`,
{
headers: {
Authorization: `Bearer ${accessToken}`,
},
}
)
return response.data.data
} catch (error) {
console.error('Error previewing template:', error)
throw error
}
}

// Apply template (Chart of Accounts)
const applyChartOfAccountsTemplate = async (templateId: string) => {
try {
const response = await axios.post(
`${API_BASE_URL}/accounts/template/${templateId}/apply`,
{},
{
headers: {
Authorization: `Bearer ${accessToken}`,
},
}
)
return response.data.data
} catch (error) {
console.error('Error applying template:', error)
throw error
}
}

// List template usages
const listTemplateUsages = async (filters?: {
page?: number
limit?: number
templateId?: string
status?: 'pending' | 'success' | 'partial' | 'failed'
}) => {
try {
const response = await axios.get(`${API_BASE_URL}/templates/usages`, {
params: filters,
headers: {
Authorization: `Bearer ${accessToken}`,
},
})
return response.data.data
} catch (error) {
console.error('Error listing template usages:', error)
throw error
}
}

// Usage example
const example = async () => {
// List all active chart of accounts templates
const templates = await listTemplates({
type: 'chart_of_accounts',
isActive: true,
})
console.log('Templates:', templates)

// Preview a template
const templateId = templates.items[0].id
const preview = await previewChartOfAccountsTemplate(templateId)
console.log('Preview:', preview)

// Apply the template
const result = await applyChartOfAccountsTemplate(templateId)
console.log('Application result:', result)

// View usage history
const usages = await listTemplateUsages({
templateId,
status: 'success',
})
console.log('Usage history:', usages)
}
Backend Integration
Using Query Functions
import {
findTemplates,
findTemplateById,
createTemplate,
updateTemplate,
deleteTemplate,
findTemplateUsages,
} from '@queries/template.queries'

// List templates
const { templates, total } = await findTemplates({
page: 1,
limit: 20,
type: TemplateType.CHART_OF_ACCOUNTS,
isActive: true,
})

// Get template by ID
const template = await findTemplateById(templateId)

// Create template (SuperAdmin only)
const newTemplate = await createTemplate(
{
name: 'Standard Chart of Accounts',
description: 'Standard chart of accounts for general business',
templateType: TemplateType.CHART_OF_ACCOUNTS,
templateData: {
accounts: [
{
accountNumber: '1000',
accountName: 'Cash',
accountType: 'asset',
accountSubtype: 'current_asset',
openingBalance: 0,
currencyCode: 'CAD',
},
],
},
isActive: true,
},
userId
)

// Update template (SuperAdmin only)
const updated = await updateTemplate(templateId, {
name: 'Updated Standard Chart of Accounts',
description: 'Updated description',
})

// Delete template (SuperAdmin only)
await deleteTemplate(templateId)

// List template usages
const { usages, total } = await findTemplateUsages(
{
page: 1,
limit: 20,
templateId,
status: TemplateUsageStatus.SUCCESS,
},
tenantId
)
Using Model Directly
import { Template, TemplateType } from '@models/Template'
import { TemplateUsage, TemplateUsageStatus } from '@models/TemplateUsage'

// Query templates with modifiers
const templates = await Template.query()
.modify('notDeleted')
.modify('active')
.modify('byType', TemplateType.CHART_OF_ACCOUNTS)
.orderBy('name', 'asc')

// Query template usages
const usages = await TemplateUsage.query()
.modify('notDeleted')
.modify('byTenant', tenantId)
.modify('byTemplate', templateId)
.modify('byStatus', TemplateUsageStatus.SUCCESS)
.orderBy('applied_at', 'desc')
Configuration
Template Data Structure
Chart of Accounts Template
{
"accounts": [
{
"accountNumber": "1000",
"accountName": "Cash",
"accountType": "asset",
"accountSubtype": "current_asset",
"accountDetailType": null,
"openingBalance": 0,
"currencyCode": "CAD",
"description": null,
"trackTax": false,
"isSystemAccount": false
}
]
}
Tax Template
{
"taxes": [
{
"name": "GST",
"type": "normal",
"rate": 10.0
}
]
}
Template Status
Active Templates: Can be previewed and applied by users
Inactive Templates: Hidden from normal queries but can be viewed by SuperAdmin
Deleted Templates: Soft-deleted, can be restored by SuperAdmin
Template Type Uniqueness
Currently, the system enforces one template per type via unique constraint on template_type. This can be extended in the future to support multiple templates per type.

Security Considerations
Authentication & Authorization
All endpoints require JWT authentication via authenticate middleware
SuperAdmin Only: Create, update, delete, restore, enable, disable templates
All Authenticated Users: View templates, view template usages (tenant-scoped)
Tenant context is enforced for template usage queries
Input Validation
All inputs are validated using Zod schemas
Template data structure is validated based on template type
Template name is required (1-255 characters)
Template type must be valid enum value
Data Protection
Templates are stored in public schema (global resources)
Template usages are tenant-scoped (users can only see their tenant's usages)
Soft delete is used instead of hard delete for data retention
Template usage tracking provides complete audit trail
Access Control
SuperAdmin has full control over templates
Regular users can view and apply templates but cannot modify them
Template usage history is tenant-scoped for regular users
SuperAdmin can view all template usages
Testing
Manual Testing Checklist
Create Template (SuperAdmin)
[ ] Create template with all required fields
[ ] Create template with valid template data structure
[ ] Create template with invalid template data (should fail)
[ ] Create template with duplicate type (should fail if unique constraint exists)
[ ] Create template as non-SuperAdmin (should fail)
List Templates
[ ] List all templates (no filters)
[ ] Filter by template type
[ ] Filter by active status
[ ] Search by template name
[ ] Search by template description
[ ] Pagination (page, limit)
[ ] Sorting (by different fields)
Get Template
[ ] Get template by ID (exists)
[ ] Get template by ID (does not exist - should return 404)
[ ] Get deleted template (should return 404)
Update Template (SuperAdmin)
[ ] Update template name
[ ] Update template description
[ ] Update template data
[ ] Update template status
[ ] Update template as non-SuperAdmin (should fail)
Delete Template (SuperAdmin)
[ ] Delete template (soft delete)
[ ] Verify template is hidden from queries
[ ] Verify template can be restored
[ ] Delete template as non-SuperAdmin (should fail)
Enable/Disable Template (SuperAdmin)
[ ] Enable inactive template
[ ] Disable active template
[ ] Enable already active template
[ ] Disable already inactive template
[ ] Enable/disable as non-SuperAdmin (should fail)
Restore Template (SuperAdmin)
[ ] Restore soft-deleted template
[ ] Restore non-deleted template (should fail)
Template Application
[ ] Preview template (valid template ID)
[ ] Preview template (invalid template ID - should fail)
[ ] Preview template (inactive template - should fail)
[ ] Apply template (creates new items)
[ ] Apply template (skips existing items)
[ ] Apply template (records usage)
[ ] Apply template (invalid template ID - should fail)
Template Usage Tracking
[ ] List template usages (tenant-scoped)
[ ] Filter usages by template ID
[ ] Filter usages by status
[ ] Get usage by ID (tenant-scoped)
[ ] Get usage from different tenant (should return 404 for regular users)
API Testing Examples
Using cURL

# List templates

curl -X GET "https://api.bkeep.ca/api/v1/templates?type=chart_of_accounts&isActive=true" \
 -H "Authorization: Bearer <access_token>"

# Get template by ID

curl -X GET "https://api.bkeep.ca/api/v1/templates/<template_id>" \
 -H "Authorization: Bearer <access_token>"

# Create template (SuperAdmin only)

curl -X POST "https://api.bkeep.ca/api/v1/templates" \
 -H "Authorization: Bearer <access_token>" \
 -H "Content-Type: application/json" \
 -d '{
"name": "Standard Chart of Accounts",
"description": "Standard chart of accounts",
"templateType": "chart_of_accounts",
"templateData": {
"accounts": [...]
},
"isActive": true
}'

# Update template (SuperAdmin only)

curl -X PUT "https://api.bkeep.ca/api/v1/templates/<template_id>" \
 -H "Authorization: Bearer <access_token>" \
 -H "Content-Type: application/json" \
 -d '{
"name": "Updated Template Name",
"description": "Updated description"
}'

# Delete template (SuperAdmin only)

curl -X DELETE "https://api.bkeep.ca/api/v1/templates/<template_id>" \
 -H "Authorization: Bearer <access_token>"

# List template usages

curl -X GET "https://api.bkeep.ca/api/v1/templates/usages?status=success" \
 -H "Authorization: Bearer <access_token>"
Using Postman
Create Collection: Create a new Postman collection for Templates
Set Variables: Set base_url and access_token as collection variables
Create Requests:
GET {{base_url}}/templates
GET {{base_url}}/templates/:id
POST {{base_url}}/templates (SuperAdmin only)
PUT {{base_url}}/templates/:id (SuperAdmin only)
DELETE {{base_url}}/templates/:id (SuperAdmin only)
POST {{base_url}}/templates/:id/restore (SuperAdmin only)
POST {{base_url}}/templates/:id/enable (SuperAdmin only)
POST {{base_url}}/templates/:id/disable (SuperAdmin only)
GET {{base_url}}/templates/usages
GET {{base_url}}/templates/usages/:id
Set Authorization: Use Bearer Token for all requests
Test Scenarios: Test all validation rules and error cases
Migration Guide
Running the Migration
The Template Management migration is in the public schema and should be run once:

# Run migration

pnpm db:migrate
Note: The migration file is located at:

src/database/migrations/20260102073633_create_templates_tables.ts
Migration Steps
Ensure Database Connection: Verify database connection is configured
Run Migration: Execute the migration command
Verify Tables: Confirm that templates and template_usages tables exist in public schema
Verify Indexes: Confirm that all indexes are created
Verify Constraints: Confirm that unique constraints and foreign keys are in place
Rollback
To rollback the migration:

pnpm db:migrate:rollback
Warning: Rolling back will drop the templates and template_usages tables and all data will be lost. Only rollback in development or if absolutely necessary.

Post-Migration
After running the migration:

Create Default Templates: Consider creating default templates for Chart of Accounts and Tax
Verify Access Control: Ensure SuperAdmin role has proper permissions
Test Template Application: Test applying templates to tenant schemas
Verify Usage Tracking: Confirm template usage records are created correctly
Future Enhancements
Planned Features
Multiple Templates per Type

Remove unique constraint on template_type
Support multiple templates per type (e.g., "Retail COA", "Manufacturing COA")
Template versioning
Template Categories

Organize templates by category (industry, jurisdiction, etc.)
Category-based filtering and search
Template Import/Export

Export templates to JSON files
Import templates from JSON files
Template sharing between instances
Template Validation

Validate template data structure before saving
Template schema validation
Data integrity checks
Template Versioning

Track template versions
Apply specific template versions
Version history and rollback
Template Customization

Allow tenants to customize templates before applying
Template parameterization
Conditional template items
Template Analytics

Usage statistics per template
Most popular templates
Template success rates
Template performance metrics
Template Scheduling

Schedule template applications
Automated template updates
Template refresh schedules
Template Permissions

Restrict template access by role
Template-level permissions
Tenant-specific template visibility
Template Marketplace

Share templates between tenants
Template marketplace/community
Template ratings and reviews
Integration Opportunities
Chart of Accounts: Already integrated - templates can be applied to create accounts
Tax Management: Already integrated - templates can be applied to create taxes
Journal Entries: Future - templates for standard journal entry patterns
Invoices: Future - invoice templates
Bills: Future - bill templates
Reports: Future - report templates
Related Documentation
Accounts: Accounts templates and application
Tax Management: Tax templates and application
Multi-Tenancy: Tenant-specific schema isolation
API Architecture: API design patterns and conventions
Role Management: SuperAdmin role and permissions
Troubleshooting
Common Issues
Issue: Template not found
Cause: Template may be soft-deleted or inactive.

Solution:

Verify template exists and is not deleted
Check if template is active (inactive templates are hidden from normal queries)
Verify template ID is correct
SuperAdmin can view deleted templates
Issue: Cannot create template (403 Forbidden)
Cause: Only SuperAdmin can create templates.

Solution:

Verify user has SuperAdmin role
Check authorization middleware configuration
Ensure JWT token includes SuperAdmin role
Issue: Template application failed
Cause: Template may be inactive, invalid, or tenant context missing.

Solution:

Verify template is active
Check template data structure is valid
Ensure tenant context is set correctly
Review error messages in result data
Issue: Template usage not found
Cause: Usage may belong to different tenant or be soft-deleted.

Solution:

Verify usage belongs to current tenant (for regular users)
Check if usage is soft-deleted
Verify usage ID is correct
SuperAdmin can view all usages
Issue: Duplicate template type
Cause: Unique constraint on template_type prevents multiple templates per type.

Solution:

Currently, only one template per type is allowed
Future enhancement will support multiple templates per type
Consider updating existing template instead of creating new one
Issue: Template data validation failed
Cause: Template data structure doesn't match expected format.

Solution:

Verify template data structure matches template type
For Chart of Accounts: ensure accounts array with valid account objects
For Tax: ensure taxes array with valid tax objects
Check all required fields are present
Validate data types match expected types
Summary
Template Management provides a comprehensive system for creating, managing, and applying pre-configured templates:

✅ Complete Template CRUD - Create, read, update, delete templates (SuperAdmin)
✅ Template Status Management - Enable/disable templates
✅ Template Preview - Preview what will be created before applying
✅ Template Application - Apply templates to tenant-specific data
✅ Usage Tracking - Complete audit trail of template applications
✅ Access Control - SuperAdmin manages, all users can view and apply
✅ Multiple Template Types - Support for Chart of Accounts and Tax
✅ Soft Deletes - Restore deleted templates
✅ Comprehensive API - 10 endpoints for all operations
✅ Tenant Isolation - Template usages are tenant-scoped

This feature enables quick setup of standard configurations for new tenants and standardization of existing tenant data.

Last Updated: January 2, 2026
Status: ✅ Complete - Ready for use
Version: 1.0.0
