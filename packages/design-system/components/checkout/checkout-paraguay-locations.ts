"use client";

import {
  paraguayCities,
  paraguayCountry,
  paraguayStates,
} from "./paraguay-geography";

interface CheckoutLocationOption {
  label: string;
  value: string;
}

const mapLocationOption = ({
  id,
  name,
}: {
  id: string;
  name: string;
}): CheckoutLocationOption => ({
  label: name,
  value: id,
});

const checkoutParaguayCountryOption = mapLocationOption(paraguayCountry);

const checkoutParaguayStateOptions: CheckoutLocationOption[] = paraguayStates
  .slice()
  .sort((left, right) => left.name.localeCompare(right.name, "es-PY"))
  .map(mapLocationOption);

const getCheckoutParaguayCityOptions = (
  stateId: string | undefined
): CheckoutLocationOption[] => {
  if (!stateId) {
    return [];
  }

  return paraguayCities
    .filter((city) => city.stateId === stateId)
    .sort((left, right) => left.name.localeCompare(right.name, "es-PY"))
    .map(mapLocationOption);
};

const getCheckoutParaguayStateName = (stateId: string | undefined) =>
  paraguayStates.find((state) => state.id === stateId)?.name;

const getCheckoutParaguayCityName = (cityId: string | undefined) =>
  paraguayCities.find((city) => city.id === cityId)?.name;

export {
  checkoutParaguayCountryOption,
  checkoutParaguayStateOptions,
  getCheckoutParaguayCityName,
  getCheckoutParaguayCityOptions,
  getCheckoutParaguayStateName,
};
export type { CheckoutLocationOption };
