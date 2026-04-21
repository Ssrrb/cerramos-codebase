import { database, eq, schema } from "@repo/database";
import type {
  CheckoutLocationCity,
  CheckoutLocationData,
  CheckoutLocationOption,
  CheckoutLocationState,
} from "@repo/design-system/components/checkout/types";
import { cache } from "react";

const sortLocationOptions = <T extends { label: string }>(options: T[]) =>
  options
    .slice()
    .sort((left, right) => left.label.localeCompare(right.label, "es-PY"));

export const getCheckoutLocationData = cache(
  async (): Promise<CheckoutLocationData> => {
    const countries: CheckoutLocationOption[] = sortLocationOptions(
      await database
        .select({
          label: schema.country.name,
          value: schema.country.id,
        })
        .from(schema.country)
        .where(eq(schema.country.isActive, true))
    );

    const states: CheckoutLocationState[] = sortLocationOptions(
      await database
        .select({
          countryId: schema.state.countryId,
          label: schema.state.name,
          value: schema.state.id,
        })
        .from(schema.state)
        .innerJoin(schema.country, eq(schema.state.countryId, schema.country.id))
        .where(eq(schema.country.isActive, true))
    );

    const cities: CheckoutLocationCity[] = sortLocationOptions(
      await database
        .select({
          label: schema.city.name,
          stateId: schema.city.stateId,
          value: schema.city.id,
        })
        .from(schema.city)
        .innerJoin(schema.state, eq(schema.city.stateId, schema.state.id))
        .innerJoin(schema.country, eq(schema.state.countryId, schema.country.id))
        .where(eq(schema.country.isActive, true))
    );

    return {
      cities,
      countries,
      states,
    };
  }
);
