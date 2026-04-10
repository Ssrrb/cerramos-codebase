# Payments Package

`packages/payments` owns shared payment-provider integration behavior and normalized payment abstractions.

Keep provider adapters and payment state handling here.
Do not collapse payment state into order state, and do not move webhook route ownership into this package.

Apps consume normalized payment behavior; they should not re-implement provider details locally.
