"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";
import {
  type CheckoutDeliveryFieldNames,
  CheckoutSelectField,
} from "./checkout-form-fields";
import {
  checkoutParaguayCityOptions,
  getCheckoutParaguayBarrioOptions,
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
  const city = useWatch({
    control,
    name: names.city,
  }) as string | undefined;
  const barrio = useWatch({
    control,
    name: names.addressLine2,
  }) as string | undefined;
  const { field: barrioField } = useController({
    control,
    name: names.addressLine2,
  });
  const previousCityRef = useRef(city);

  const barrioOptions = useMemo(
    () => getCheckoutParaguayBarrioOptions(city),
    [city]
  );

  useEffect(() => {
    if (previousCityRef.current !== city) {
      previousCityRef.current = city;
      barrioField.onChange("");
      return;
    }

    previousCityRef.current = city;
  }, [barrioField, city]);

  useEffect(() => {
    if (!barrio) {
      return;
    }

    const isBarrioValid = barrioOptions.some(
      (option) => option.value === barrio
    );

    if (!isBarrioValid) {
      barrioField.onChange("");
    }
  }, [barrio, barrioField, barrioOptions]);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <CheckoutSelectField
        control={control}
        disabled={disabled}
        label="Ciudad"
        name={names.city}
        options={checkoutParaguayCityOptions}
        placeholder="Seleccioná una ciudad"
        rules={
          requiredCityMessage
            ? {
                required: requiredCityMessage,
              }
            : undefined
        }
      />
      <CheckoutSelectField
        control={control}
        description={
          city
            ? "Mostramos solo los barrios disponibles para la ciudad elegida."
            : "Elegí primero una ciudad para ver los barrios disponibles."
        }
        disabled={disabled || !city}
        label="Barrio"
        name={names.addressLine2}
        options={barrioOptions}
        placeholder={
          city ? "Seleccioná un barrio" : "Primero seleccioná una ciudad"
        }
      />
    </div>
  );
}

export { CheckoutLocationFields };
