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
  checkoutParaguayCountryOption,
  checkoutParaguayStateOptions,
  getCheckoutParaguayCityOptions,
} from "./checkout-paraguay-locations";

interface CheckoutLocationFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  names: CheckoutDeliveryFieldNames<TFieldValues>;
  requiredCityMessage?: string;
}

function CheckoutLocationFields<TFieldValues extends FieldValues>({
  control,
  disabled,
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
  const { field: cityField } = useController({
    control,
    name: names.cityId,
  });
  const previousStateRef = useRef(stateId);

  const cityOptions = useMemo(
    () => getCheckoutParaguayCityOptions(stateId),
    [stateId]
  );

  useEffect(() => {
    if (countryId === checkoutParaguayCountryOption.value) {
      return;
    }

    countryField.onChange(checkoutParaguayCountryOption.value);
  }, [countryField, countryId]);

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
        description="Por ahora coordinamos entregas solo dentro de Paraguay."
        disabled
        label="País"
        name={names.countryId}
        options={[checkoutParaguayCountryOption]}
      />
      <CheckoutSelectField
        control={control}
        disabled={disabled}
        label="Departamento"
        name={names.stateId}
        options={checkoutParaguayStateOptions}
        placeholder="Seleccioná un departamento"
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
