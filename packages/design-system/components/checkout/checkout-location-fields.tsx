"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";
import {
  type CheckoutDeliveryFieldNames,
  CheckoutInputField,
  CheckoutSelectField,
} from "./checkout-form-fields";
import {
  checkoutParaguayLocationData,
  checkoutParaguayCountryOption,
} from "./checkout-paraguay-locations";
import type { CheckoutLocationData } from "./types";

interface CheckoutLocationFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  locationData?: CheckoutLocationData;
  names: CheckoutDeliveryFieldNames<TFieldValues>;
  requiredCityMessage?: string;
}

function CheckoutLocationFields<TFieldValues extends FieldValues>({
  control,
  disabled,
  locationData = checkoutParaguayLocationData,
  names,
  requiredCityMessage,
}: CheckoutLocationFieldsProps<TFieldValues>) {
  const countryId = useWatch({
    control,
    name: names.countryId,
  }) as string | undefined;
  const stateId = useWatch({
    control,
    name: names.stateId,
  }) as string | undefined;
  const cityId = useWatch({
    control,
    name: names.cityId,
  }) as string | undefined;
  const { field: countryField } = useController({
    control,
    name: names.countryId,
  });
  const { field: stateField } = useController({
    control,
    name: names.stateId,
  });
  const { field: cityField } = useController({
    control,
    name: names.cityId,
  });
  const previousStateRef = useRef(stateId);
  const previousCountryRef = useRef(countryId);

  const countryOptions = locationData.countries;
  const stateOptions = useMemo(
    () =>
      locationData.states
        .filter((option) => option.countryId === countryId)
        .map(({ countryId: _countryId, ...option }) => option),
    [countryId, locationData.states]
  );

  const cityOptions = useMemo(
    () =>
      locationData.cities
        .filter((option) => option.stateId === stateId)
        .map(({ stateId: _stateId, ...option }) => option),
    [locationData.cities, stateId]
  );

  useEffect(() => {
    if (countryId) {
      return;
    }

    const defaultCountryId =
      countryOptions[0]?.value ?? checkoutParaguayCountryOption.value;

    if (!defaultCountryId) {
      return;
    }

    countryField.onChange(defaultCountryId);
  }, [countryField, countryId, countryOptions]);

  useEffect(() => {
    if (previousCountryRef.current === countryId) {
      return;
    }

    previousCountryRef.current = countryId;

    const isStateValid = stateOptions.some((option) => option.value === stateId);

    if (isStateValid) {
      return;
    }

    stateField.onChange("");
    cityField.onChange("");
  }, [cityField, countryId, stateField, stateId, stateOptions]);

  useEffect(() => {
    if (previousStateRef.current !== stateId) {
      previousStateRef.current = stateId;
      cityField.onChange("");
      return;
    }

    previousStateRef.current = stateId;
  }, [cityField, stateId]);

  useEffect(() => {
    if (!cityId) {
      return;
    }

    const isCityValid = cityOptions.some((option) => option.value === cityId);

    if (!isCityValid) {
      cityField.onChange("");
    }
  }, [cityField, cityId, cityOptions]);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <CheckoutSelectField
        control={control}
        description={
          countryOptions.length > 1
            ? "Elegí el país para ver los departamentos disponibles."
            : "Por ahora coordinamos entregas solo dentro de Paraguay."
        }
        disabled={disabled || countryOptions.length <= 1}
        label="País"
        name={names.countryId}
        options={countryOptions}
      />
      <CheckoutSelectField
        control={control}
        disabled={disabled || !countryId}
        label="Departamento"
        name={names.stateId}
        options={stateOptions}
        placeholder={
          countryId
            ? "Seleccioná un departamento"
            : "Primero seleccioná un país"
        }
        rules={{
          required: "Indicá el departamento de entrega.",
        }}
      />
      <CheckoutSelectField
        control={control}
        description={
          stateId
            ? "Mostramos solo las ciudades disponibles para el departamento elegido."
            : "Elegí primero un departamento para ver las ciudades disponibles."
        }
        disabled={disabled || !stateId}
        label="Ciudad"
        name={names.cityId}
        options={cityOptions}
        placeholder={
          stateId ? "Seleccioná una ciudad" : "Primero seleccioná un departamento"
        }
        rules={
          requiredCityMessage
            ? {
                required: requiredCityMessage,
              }
            : undefined
        }
      />
      <CheckoutInputField
        control={control}
        description="Opcional. Departamento, piso, torre o barrio para complementar la dirección."
        disabled={disabled}
        label="Complemento"
        name={names.streetLine2}
        placeholder="Depto 204, Torre 2, Barrio Jara"
      />
    </div>
  );
}

export { CheckoutLocationFields };
