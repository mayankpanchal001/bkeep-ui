# Transaction Rules Feature

## Overview

The Transaction Rules feature allows you to automatically categorize, split, or exclude bank transactions based on flexible conditions, similar to QuickBooks Online bank rules. Rules run tenant‑scoped and can be:

- Applied automatically to unreviewed transactions after an import
- Applied manually to a single transaction from the Transactions screen
- Tested safely without changing data to preview their effect

Each rule combines:

- **Scope**: Transaction type and account selection
- **Conditions**: Text/amount filters on transaction fields
- **Actions**: Category/contact/memo/tax updates, splits, and exclusions

---

## Flow

### Rule Creation Flow

```
1. User defines rule
   - Name and description
   - Transaction type (any/income/expense)
   - Account scope (all/selected accounts)
   - Conditions (fields, operators, values)
   - Actions (category/contact/memo/taxes/type/splits/exclude)
   ↓
2. API validates payload with createRuleSchema
   - At least one condition and one action required
   - accountIds required when accountScope = selected
   ↓
3. System creates rule
   - Insert into rules table
   - Insert related rule_conditions and rule_actions rows
   ↓
4. Default flags applied
   - active/is_active default true
   - autoApply default false
   - stopOnMatch default true
   - priority default 100
   ↓
5. Return created rule with conditions and actions
```

### Manual Apply Flow (Single Transaction)

```
1. User clicks "Apply rules" on a transaction
   ↓
2. API loads transaction by ID (tenant + notDeleted)
   ↓
3. Load active rules for tenant
   - notDeleted, active/is_active = true
   - ordered by priority then created_at
   - with conditions and actions
   ↓
4. Evaluate rules in order
   - Skip if accountScope = selected and accountId not in accountIds
   - Skip if transactionType is not any and does not match tx.type
   - Evaluate all conditions (description/reference/amount)
   - Apply matchType (all/any) to decide match
   ↓
5. For each matching rule
   - Build patch for category/contact/memo/taxes/type
   - If exclude action present → mark transaction voided and reviewed
   - If splits action present → compute and validate splits
   - Apply updates via updateTransaction and setTransactionSplits
   - Record rule ID as applied
   - If stopOnMatch = true, stop processing further rules
   ↓
6. Return appliedRuleIds and transactionId
```

### Auto-Apply Flow (After Import)

```
1. Transactions import job completes with status = completed
   ↓
2. Import processor calls autoApplyRulesForUnreviewedTransactions
   - tenantId, schemaName, userId
   - optional accountId from import job
   ↓
3. System selects candidate transactions
   - notDeleted, byTenant
   - is_reviewed = false
   - optional filter by account_id
   - limit (default 500) ordered by paid_at asc
   ↓
4. For each transaction ID
   - Call applyRulesToTransaction with options.autoOnly = true
   - Only autoApply = true rules are considered
   - Same evaluation logic as manual apply
   ↓
5. Count statistics
   - totalProcessed = number of transactions evaluated
   - totalWithMatches = transactions where at least one rule applied
   ↓
6. Return auto-apply summary
```

### Rule Test Flow

```
1. User configures test payload
   - transactionType, matchType
   - conditions (required)
   - actions (optional; preview only)
   - accountScope/accountIds
   - testAgainstAll or specific transactionId
   - limit (max 500)
   ↓
2. API validates payload with testRuleSchema
   - transactionId required when testAgainstAll is false
   - accountIds required when accountScope = selected
   ↓
3. System selects transactions to evaluate
   - If testAgainstAll: latest transactions ordered by paidAt desc (up to limit)
   - Else: single transaction by transactionId
   - Optional filtering by transactionType and accountIds
   ↓
4. Evaluate conditions for each transaction
   - Use same evalCondition logic as real rules
   - Apply matchType (all/any)
   ↓
5. Build preview for matches (if actions provided)
   - Simulate set_category/set_contact/set_memo/set_taxes/set_type
   - Simulate set_splits (percent/amount) without writing to DB
   - Mark excluded = true when exclude action present
   ↓
6. Return test result
   - totalTested, totalMatched
   - matches[] with transactionId, match flag, and optional preview
```

---

## Features Implemented

- **Tenant‑Scoped Rules**: Rules, conditions, and actions are stored per tenant in the tenant schema.
- **Transaction Type Filter**: Apply rules to income, expense, or any transaction type.
- **Account Scope**:
  - All accounts
  - Selected accounts only (multiple accounts supported)
- **String Conditions** (description, reference):
  - contains / not_contains
  - starts_with / ends_with
  - equals
  - optional case sensitivity
- **Amount Conditions** (amount):
  - equals (with 2‑decimal rounding)
  - lt (less than)
  - gt (greater than)
  - between (inclusive range)
- **Match Strategy**:
  - all – every condition must match
  - any – at least one condition must match
- **Actions**:
  - set_category
  - set_contact
  - set_memo
  - set_taxes
  - set_type (income/expense)
  - set_splits (percent or fixed‑amount splits)
  - exclude (void and mark as reviewed)
- **Auto‑Apply Pipeline**:
  - Runs after a successful transaction import
  - Evaluates active, auto‑apply rules against unreviewed transactions
  - Supports optional account filtering and processing limits
- **Soft Delete and Restore**:
  - Rules can be disabled, soft‑deleted, and later restored

## Database Schema

Rules are stored in three tenant tables: `rules`, `rule_conditions`, and `rule_actions`.

### Table: `rules` (Tenant Schema)

Defined in migration
[20260112212629_create_rules_tables.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/database/migrations/tenant/20260112212629_create_rules_tables.ts).

```sql
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  transaction_type VARCHAR(20) NOT NULL DEFAULT 'any',   -- any | income | expense
  match_type VARCHAR(10) NOT NULL DEFAULT 'all',         -- all | any
  auto_apply BOOLEAN NOT NULL DEFAULT FALSE,
  stop_on_match BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 100,
  account_scope VARCHAR(20) NOT NULL DEFAULT 'all',      -- all | selected
  account_ids JSONB NOT NULL DEFAULT '[]',               -- array of account UUIDs
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

Model: [Rule](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/models/Rule.ts).

### Table: `rule_conditions` (Tenant Schema)

```sql
CREATE TABLE rule_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  field VARCHAR(50) NOT NULL,          -- description | reference | amount
  operator VARCHAR(30) NOT NULL,       -- contains | not_contains | starts_with | ends_with | equals | lt | gt | between
  value_string TEXT NULL,
  value_number DECIMAL(15,4) NULL,
  value_number_to DECIMAL(15,4) NULL,
  case_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

Model: [RuleCondition](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/models/RuleCondition.ts).

### Table: `rule_actions` (Tenant Schema)

```sql
CREATE TABLE rule_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

Model: [RuleAction](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/models/RuleAction.ts).

## Core Concepts

### Rule Scope

Each rule controls where and when it can apply:

- **transactionType** (`any` | `income` | `expense`)
  - Filters by transaction `type`.
  - `any` matches both income and expense.
- **accountScope** (`all` | `selected`)
  - all: rule can apply to any account.
  - selected: rule only applies if the transaction `accountId` is in `accountIds`.
- **accountIds**
  - Array of account UUIDs used when `accountScope = selected`.

### Conditions

Schema: [rule.schema.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/schema/rule.schema.ts#L5-L25).

```ts
field: 'description' | 'reference' | 'amount'
operator:
  // String operators
  'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'equals'
  // Number operators
  'equals' | 'lt' | 'gt' | 'between'
valueString?: string
valueNumber?: number
valueNumberTo?: number
caseSensitive?: boolean
```

Evaluation logic is implemented in
[rule.queries.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/rule.queries.ts#L22-L71):

- **description/reference**
  - Text is normalized (lowercased) unless `caseSensitive` is true.
  - Operators:
    - `contains`: substring match
    - `not_contains`: negated substring match
    - `starts_with`: prefix match
    - `ends_with`: suffix match
    - `equals`: full‑string equality
- **amount**
  - The transaction amount and condition values are converted to numbers.
  - Operators:
    - `equals`: compares `Number(v.toFixed(2)) === Number(a.toFixed(2))`
    - `lt`: `v < a`
    - `gt`: `v > a`
    - `between`: `v` is between `valueNumber` and `valueNumberTo` (inclusive),
      regardless of order.

### Match Type

- **matchType `all`**
  - Every condition must evaluate to `true` for the rule to match.
- **matchType `any`**
  - At least one condition must evaluate to `true` for the rule to match.

Implementation:
- Rules are evaluated in memory using `evalCondition` and `matchType` in
  [applyRulesToTransaction](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/rule.queries.ts#L374-L423).

### Actions

Actions are configured via a discriminated union on `actionType` in
[rule.schema.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/schema/rule.schema.ts#L41-L89):

```ts
// set_category
{ actionType: 'set_category', payload: { categoryId: string } }

// set_contact
{ actionType: 'set_contact', payload: { contactId: string } }

// set_memo
{ actionType: 'set_memo', payload: { memo: string } }

// set_taxes
{ actionType: 'set_taxes', payload: { taxIds: string[] } }

// set_type
{ actionType: 'set_type', payload: { type: 'income' | 'expense' } }

// exclude
{ actionType: 'exclude', payload?: {} }

// set_splits (percent or amount mode)
{
  actionType: 'set_splits',
  payload:
    | { mode: 'percent'; lines: { percent: number; categoryId?; description?; taxIds? }[] }
    | { mode: 'amount'; lines: { amount: number; categoryId?; description?; taxIds? }[] }
}
```

Semantics in
[applyRulesToTransaction](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/rule.queries.ts#L425-L609):

- **set_category**
  - Validates the category account exists in the tenant before applying.
  - Updates `transaction.categoryId`.
- **set_contact**
  - Updates `transaction.contactId`.
- **set_memo**
  - Updates `transaction.description`.
- **set_taxes**
  - Updates associated transaction taxes via `taxIds` payload when combined
    with transaction update logic.
- **set_type**
  - Changes transaction `type` between `income` and `expense`.
- **exclude**
  - Marks the transaction as voided and reviewed:
    - `status = voided`
    - `is_reviewed = true`
    - `reviewed_at` and `reviewed_by` are set.
- **set_splits**
  - Creates or updates transaction splits via
    [setTransactionSplits](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/transaction.queries.ts).
  - Percent mode:
    - Each line specifies `percent` of the transaction amount.
    - Validation in the schema requires percentages to sum to exactly 100.
    - Amounts are rounded to 2 decimals when applied, and the last line is
      adjusted so total matches the transaction amount.
  - Amount mode:
    - Each line specifies a fixed `amount`.
    - Lines are processed sequentially; if intermediate sums exceed the
      transaction amount, the split set is discarded.
    - The last line is adjusted so the sum of splits equals the transaction
      amount (with 2‑decimal rounding in the apply path).

## Rule Evaluation Flow

Core evaluation is implemented in
[rule.queries.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/rule.queries.ts#L374-L613).

High‑level algorithm for a single transaction:

1. Load the transaction by ID (respecting tenant and soft‑delete filters).
2. Load active rules for the tenant, ordered by `priority` then `created_at`.
3. Optionally restrict to `auto_apply = true` when running in auto‑apply mode.
4. For each rule:
   - Skip if `accountScope = selected` and transaction `accountId` is not in
     `accountIds`.
   - Skip if `transactionType` is not `any` and does not match the transaction
     `type`.
   - Evaluate all `conditions` via `evalCondition`.
   - Apply `matchType` (all/any) to decide if the rule matches.
   - If the rule matches:
     - Build a patch based on actions (category, contact, memo, taxes, type).
     - If `exclude` is present, void and review the transaction.
     - If there is a patch, call
       [updateTransaction](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/transaction.queries.ts)
       with the updated fields.
     - If `set_splits` produced valid splits, call `setTransactionSplits`.
     - Record the applied rule ID.
     - If `stopOnMatch` is true on the rule, stop evaluating further rules.
5. Return the list of applied rule IDs and the transaction ID.

## Auto‑Apply After Import

When a transaction import job completes successfully, rules can be auto‑applied
to unreviewed transactions.

Implementation:

- Import processor: see
  [importProcessor.service.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/services/importProcessor.service.ts#L262-L411).
- Auto‑apply helper:
  [autoApplyRulesForUnreviewedTransactions](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/rule.queries.ts#L905-L945).

Flow:

1. Import job finishes with status `completed` for entity type `transactions`.
2. The import processor calls `autoApplyRulesForUnreviewedTransactions` with:
   - `tenantId`
   - `schemaName`
   - `userId` (used as `reviewed_by` for exclude actions)
   - Optional `accountId` filter from the import job
3. Auto‑apply helper:
   - Queries up to `limit` (default 500) transactions where `is_reviewed = false`.
   - Optionally filters by `account_id`.
   - For each transaction ID, calls `applyRulesToTransaction` in auto‑only mode
     (`auto_apply = true`).
   - Counts how many transactions had at least one rule applied.
4. Returns statistics: `totalProcessed` and `totalWithMatches`.

## API Endpoints

Routes are defined in
[rule.route.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/routes/rule.route.ts)
and are exposed under the main API prefix (e.g. `/api/v1`).

### 1. List Rules

**Endpoint:** `GET /api/v1/rules`

Query parameters:

- `page` (integer, default 1)
- `limit` (integer, default 20, max 100)
- `search` (string; matches name/description)
- `active` (`true` | `false`)
- `sort` (`createdAt` | `updatedAt` | `priority`)
- `order` (`asc` | `desc`)

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource fetched successfully",
  "data": {
    "items": [
      {
        "id": "...",
        "name": "Amazon office supplies",
        "description": "Split Amazon expenses",
        "active": true,
        "transactionType": "expense",
        "matchType": "all",
        "autoApply": true,
        "stopOnMatch": true,
        "priority": 10,
        "accountScope": "selected",
        "accountIds": ["..."]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. Create Rule

**Endpoint:** `POST /api/v1/rules`

Body schema is based on `createRuleSchema` in
[rule.schema.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/schema/rule.schema.ts#L91-L107).

Example request:

```json
{
  "name": "Amazon office supplies",
  "description": "Split Amazon purchases between office supplies and misc",
  "transactionType": "expense",
  "matchType": "all",
  "autoApply": true,
  "stopOnMatch": true,
  "priority": 10,
  "accountScope": "selected",
  "accountIds": ["11111111-1111-1111-1111-111111111111"],
  "conditions": [
    {
      "field": "description",
      "operator": "contains",
      "valueString": "Amazon",
      "caseSensitive": false
    }
  ],
  "actions": [
    {
      "actionType": "set_splits",
      "payload": {
        "mode": "percent",
        "lines": [
          {
            "percent": 70,
            "categoryId": "22222222-2222-2222-2222-222222222222"
          },
          {
            "percent": 30,
            "categoryId": "33333333-3333-3333-3333-333333333333"
          }
        ]
      }
    }
  ]
}
```

### 3. Get/Update/Delete Rule

- `GET /api/v1/rules/{id}` – fetch a single rule
- `PATCH /api/v1/rules/{id}` – update a rule (uses `updateRuleSchema`)
- `DELETE /api/v1/rules/{id}` – soft‑delete a rule
- `PATCH /api/v1/rules/{id}/restore` – restore a soft‑deleted rule

### 4. Enable/Disable Rule

- `POST /api/v1/rules/{id}/enable` – set `active/is_active` to true
- `POST /api/v1/rules/{id}/disable` – set `active/is_active` to false

### 5. Test Rule

**Endpoint:** `POST /api/v1/rules/test`

Allows you to test a rule definition (conditions and optional actions) against
existing transactions without modifying data.

Body schema: `testRuleSchema` in
[rule.schema.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/schema/rule.schema.ts#L151-L177).

Key fields:

- `transactionType`: `any` | `income` | `expense`
- `matchType`: `all` | `any`
- `conditions`: required array of conditions
- `actions`: optional array of actions (used for preview only)
- `accountScope`: `all` | `selected`
- `accountIds`: when `accountScope = selected`
- `testAgainstAll`: when true, sample recent transactions (up to `limit`)
- `transactionId`: when provided, test against a single transaction
- `limit`: max transactions to test (1–500)

Example request:

```json
{
  "transactionType": "expense",
  "matchType": "all",
  "conditions": [
    {
      "field": "description",
      "operator": "contains",
      "valueString": "Amazon"
    }
  ],
  "actions": [
    {
      "actionType": "set_category",
      "payload": {
        "categoryId": "22222222-2222-2222-2222-222222222222"
      }
    }
  ],
  "accountScope": "selected",
  "accountIds": ["11111111-1111-1111-1111-111111111111"],
  "testAgainstAll": true,
  "limit": 25
}
```

Response shape (simplified):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Test result generated successfully",
  "data": {
    "totalTested": 10,
    "totalMatched": 4,
    "matches": [
      {
        "transactionId": "...",
        "match": true,
        "preview": {
          "type": "expense",
          "categoryId": "2222...",
          "contactId": null,
          "description": "Amazon Marketplace",
          "taxIds": ["..."],
          "splits": [
            {
              "amount": 70,
              "categoryId": "2222..."
            },
            {
              "amount": 30,
              "categoryId": "3333..."
            }
          ],
          "excluded": false
        }
      }
    ]
  }
}
```

### 6. Apply Rules to a Single Transaction

**Endpoint:** `POST /api/v1/transactions/{id}/apply-rules`

Defined in
[transaction.route.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/routes/transaction.route.ts#L843-L897)
and implemented by calling `applyRulesToTransaction`.

Behavior:

- Uses the same evaluation logic as auto‑apply.
- Evaluates all active rules (including non‑auto‑apply) in priority order.
- Applies matching rule actions to the specified transaction.

Response (simplified):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Transaction updated successfully",
  "data": {
    "transactionId": "...",
    "appliedRuleIds": ["..."]
  }
}
```

## Code References

- Routes: [rule.route.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/routes/rule.route.ts)
- Controller: [rule.controller.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/controllers/rule.controller.ts)
- Queries and evaluation:
  [rule.queries.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/queries/rule.queries.ts)
- Schemas: [rule.schema.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/schema/rule.schema.ts)
- Transaction rules endpoint:
  [transaction.route.ts](file:///Users/vaibhavsaini/Developer/Personal/Bkeep/ts-backend/src/routes/transaction.route.ts)
