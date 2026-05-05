# Fix: direcciones page uses wrong fallback for customer ID

## Bug
`apps/web/app/[locale]/account/direcciones/page.tsx` line 34:

```ts
session.user.customerId ?? session.user.id
```

`customerAddress.customerId` in the DB references `customerProfile.id`, not auth `user.id`. When `session.user.customerId` is null/undefined (stale/missing session cookie), the `?? session.user.id` fallback queries addresses with an ID that can never match — so signed-in users with stored addresses see an empty page.

## Evidence: every other call site does it right
- `apps/web/app/api/account/addresses/route.ts` — `resolveCustomerId()` → `getCurrentCustomerProfile()` → `customerProfile?.id ?? session.user.customerId`
- `apps/web/app/api/account/addresses/[addressId]/route.ts` — same pattern
- `apps/web/app/[locale]/(checkout)/buy/.../page.tsx` — `getCurrentCustomerProfile()` → `customerProfile.id`
- `apps/web/app/api/checkout/saved-details/route.ts` — `customerProfile?.id ?? session.user.customerId`
- `apps/web/app/api/buy/.../orders/route.ts` — `getCurrentCustomerProfile()` → `customerProfile.id`

The direcciones page is the only outlier.

## Tasks

### 1. Fix `apps/web/app/[locale]/account/direcciones/page.tsx`
- Import `getCurrentCustomerProfile` from `@repo/auth/server`
- Replace `session.user.customerId ?? session.user.id` with:
  ```ts
  const customerProfile = await getCurrentCustomerProfile();
  const customerId = customerProfile?.id ?? session.user.customerId;
  ```
- If `customerId` is undefined/null, render the empty state (user has no customer profile yet = genuinely no addresses)
- Match the existing error UI pattern: the catch block already renders `<Empty>` with header/description — use that for the no-customer case too, or simply pass empty addresses

### 2. Write test `apps/web/app/[locale]/account/direcciones/page.test.tsx`
Follow the testing pattern from `apps/web/app/[locale]/(checkout)/buy/[commerceSlug]/[productLinkSlug]/page.test.tsx`:

Mock strategy:
- Mock `@repo/auth/server`: `getCurrentCustomerProfile`, `requireSession`
- Mock `@/lib/customer-addresses`: `getCustomerAddressesPageData`
- Mock `./page-client`: render props as JSON (`renderToStaticMarkup`)

Test cases:
1. **Customer profile found** → `getCustomerAddressesPageData` called with `customerProfile.id`
2. **No customer profile, but `session.user.customerId` present** → called with that fallback
3. **Both null** → page renders without error, empty address list
4. **Existing error state** → catch block renders the existing `<Empty>` with "Hubo un problema" UI
