"use client";

import {
  paraguayCities,
  paraguayCountry,
  paraguayStates,
} from "./paraguay-geography";
import type {
  CheckoutLocationCity,
  CheckoutLocationData,
  CheckoutLocationOption,
  CheckoutLocationState,
} from "./types";

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

const mapStateOption = ({
  countryId,
  id,
  name,
}: {
  countryId: string;
  id: string;
  name: string;
}): CheckoutLocationState => ({
  countryId,
  label: name,
  value: id,
});

const mapCityOption = ({
  id,
  name,
  stateId,
}: {
  id: string;
  name: string;
  stateId: string;
}): CheckoutLocationCity => ({
  label: name,
  stateId,
  value: id,
});

const checkoutParaguayCountryOption = mapLocationOption(paraguayCountry);

const checkoutParaguayStateOptions: CheckoutLocationState[] = paraguayStates
  .slice()
  .sort((left, right) => left.name.localeCompare(right.name, "es-PY"))
  .map(mapStateOption);

const getCheckoutParaguayCityOptions = (
  stateId: string | undefined
): CheckoutLocationCity[] => {
  if (!stateId) {
    return [];
  }

  return paraguayCities
    .filter((city) => city.stateId === stateId)
    .sort((left, right) => left.name.localeCompare(right.name, "es-PY"))
    .map(mapCityOption);
};

const checkoutParaguayLocationData: CheckoutLocationData = {
  cities: paraguayCities
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, "es-PY"))
    .map(mapCityOption),
  countries: [checkoutParaguayCountryOption],
  states: checkoutParaguayStateOptions,
};

const getCheckoutParaguayStateName = (stateId: string | undefined) =>
  paraguayStates.find((state) => state.id === stateId)?.name;

const getCheckoutParaguayCityName = (cityId: string | undefined) =>
  paraguayCities.find((city) => city.id === cityId)?.name;

export {
  checkoutParaguayLocationData,
  checkoutParaguayCountryOption,
  checkoutParaguayStateOptions,
  getCheckoutParaguayCityName,
  getCheckoutParaguayCityOptions,
  getCheckoutParaguayStateName,
};
