# Verify Selected Address Ownership Before Default Reset — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
> **For Codex:** This plan is structured for you to implement directly. Work through tasks in order.

**Goal:** Fix `applyDefaultAddressSelection` so it validates that a customer address belongs to the customer BEFORE clearing all existing defaults, preventing a data-loss scenario where an invalid/foreign address ID leaves the customer with zero default addresses.

**Architecture:** Add a SELECT query to verify address ownership/existence before the destructive UPDATE. Keep the existing clear-then-set UPDATE order to avoid violating the partial unique index `CustomerAddress_customerId_default_key (customerId) WHERE isDefault = true`.

**Tech Stack:** TypeScript, Drizzle ORM, PostgreSQL, Vitest

**File to modify:** `apps/web/lib/product-links.ts` — the `applyDefaultAddressSelection` function at lines 856-881

---

## Bug Analysis

### Current code (`apps/web/lib/product-links.ts:856-881`)

```typescript
const applyDefaultAddressSelection = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  customerId: string,
  customerAddressId: string
) => {
  // STEP 1: DESTRUCTIVE — clears isDefault on ALL customer addresses
  await tx
    .update(schema.customerAddress)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(schema.customerAddress.customerId, customerId));

  // STEP 2: REPARATIVE — sets isDefault=true on the target address
  await tx
    .update(schema.customerAddress)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(
      and(
        eq(schema.customerAddress.id, customerAddressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    );
};
```

**Database constraint:** There's a partial unique index at `packages/database/schema.ts:539-541`:
```sql
CREATE UNIQUE INDEX "CustomerAddress_customerId_default_key"
  ON "CustomerAddress" (customerId)
  WHERE isDefault = true;
```

This enforces at most one default address per customer. You cannot naively swap the order (set first, clear second) — if there's already a default, setting a second one triggers the unique violation at statement level.

**Call sites (both in `product-links.ts`):**
1. Line 1128-1132 — when `selectedCustomerAddress` exists and `saveAsDefault` is true. The caller pre-validates ownership via `resolveSelectedCustomerAddress` (which throws on mismatch), so this path is currently safe.
2. Line 924 — in `persistCustomerAddressForCheckout`, called with a freshly-inserted address that IS owned. Also currently safe.

**The vulnerability:** The function itself has no internal ownership guard. If any future call site omits pre-validation, or if the pre-validation is subtly weakened, step 1 destroys the customer's default address data with no recovery — step 2 silently affects zero rows, and the customer is left with no default address.

### Desired behavior

After the fix, `applyDefaultAddressSelection` should:
1. Select the address to verify it exists and belongs to the customer
2. If validation fails, throw a descriptive error (before any mutation)
3. If validation passes, clear existing defaults and set the new one

---

## Tasks

### Task 1: Add test for foreign address ID rejection

**Objective:** Write a failing test that proves the function doesn't guard against foreign address IDs.

**File:** `apps/web/lib/product-links.test.ts`

We'll need to export the internal `applyDefaultAddressSelection` for testing. Since the test file uses `vi.mock("@repo/database")` at module level and imports dynamically, we'll write a focused unit test with a hand-crafted mock transaction.

**Step 1: Export the function for test access**

In `apps/web/lib/product-links.ts`, add after line 881:

```typescript
export const _applyDefaultAddressSelection = applyDefaultAddressSelection;
```

**Step 2: Write the test**

Add to the end of the main `describe` block in `apps/web/lib/product-links.test.ts` (before the closing `});`):

```typescript
test("applyDefaultAddressSelection rejects foreign address without mutating defaults", async () => {
  const { _applyDefaultAddressSelection } = await import("./product-links");

  // Track SELECT and UPDATE calls to verify order of operations
  const calls: string[] = [];

  const txMock = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]), // simulate: address not found
      }),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    })),
  };

  await expect(
    _applyDefaultAddressSelection(
      txMock as Parameters<typeof _applyDefaultAddressSelection>[0],
      "customer_real",
      "address_foreign"
    )
  ).rejects.toThrow("does not belong to this customer");

  // Verify update was NEVER called — no destructive mutation happened
  expect(txMock.update).not.toHaveBeenCalled();
});
```

**Step 3: Run to verify it fails**

```bash
bun run --cwd apps/web test -- -t "foreign address"
```

Expected: FAIL — the current function doesn't throw, it clears all defaults first.

---

### Task 2: Implement the fix — add ownership validation before destructive UPDATE

**Objective:** Add a SELECT query before the destructive UPDATE to verify the address exists and belongs to the customer.

**File:** `apps/web/lib/product-links.ts`

Replace lines 856-881 (the entire `applyDefaultAddressSelection` function) with:

```typescript
const applyDefaultAddressSelection = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  customerId: string,
  customerAddressId: string
) => {
  // Step 0: Verify the address exists and belongs to this customer BEFORE
  // any destructive mutation. This prevents leaving the customer with no
  // default address when a foreign/invalid address ID is provided.
  const [address] = await tx
    .select({ id: schema.customerAddress.id })
    .from(schema.customerAddress)
    .where(
      and(
        eq(schema.customerAddress.id, customerAddressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    );

  if (!address) {
    throw new Error(
      "The selected address does not belong to this customer."
    );
  }

  // Step 1: Clear isDefault on all of the customer's addresses.
  // Safe because we validated ownership above.
  await tx
    .update(schema.customerAddress)
    .set({
      isDefault: false,
      updatedAt: new Date(),
    })
    .where(eq(schema.customerAddress.customerId, customerId));

  // Step 2: Set the selected address as the new default.
  // customerId guard is retained for defense-in-depth.
  await tx
    .update(schema.customerAddress)
    .set({
      isDefault: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.customerAddress.id, customerAddressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    );
};
```

No new imports needed — `eq`, `and`, `schema` are already imported.

**Why this approach:**
- Adds one SELECT (cheap, indexed by the primary key) before any mutation
- Preserves the clear-then-set UPDATE order required by the `WHERE isDefault = true` unique index
- Throws a descriptive error if the address is foreign/invalid, preventing silent data loss
- Defense-in-depth: the function is now safe regardless of what the caller does

---

### Task 3: Verify the fix passes the new test

```bash
bun run --cwd apps/web test -- -t "foreign address"
```

Expected: PASS — function throws with the right error message, `tx.update` is never called.

---

### Task 4: Run all existing tests to confirm no regressions

```bash
bun run --cwd apps/web test -- product-links
```

Expected: All tests pass (including the "saves a new customer address and links it" test at line 1106 which exercises the `saveAsDefault: true` code path, and the "uses a saved address for delivery" test at line 1010 which exercises the saved address path).

```bash
bun run test
```

Expected: Full suite passes.

---

### Task 5: Commit

```bash
git add apps/web/lib/product-links.ts apps/web/lib/product-links.test.ts
git commit -m "fix: validate address ownership before clearing defaults in applyDefaultAddressSelection"
```

---

## Verification Checklist

- [ ] Foreign address ID → function throws "does not belong to this customer", no UPDATE issued
- [ ] Owned address ID → function clears old defaults and sets new one
- [ ] Fresh customer with first address → `persistCustomerAddressForCheckout` still works (line 924)
- [ ] Saved address + saveAsDefault flow → still works (line 1128)
- [ ] Partial unique index not violated
- [ ] All existing tests pass
- [ ] No new Drizzle imports required
