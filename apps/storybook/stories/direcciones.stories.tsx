import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddressAddTile,
  AddressCard,
  AddressFormSection,
  AddressesPanel,
  type AddressFormValues,
  type CustomerAddressSummary,
} from "@repo/design-system/components/addresses";
import { Button } from "@repo/design-system/components/ui/button";
import { Form } from "@repo/design-system/components/ui/form";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const addressFormSchema = z.object({
  cityId: z.string().trim().min(1, "Indicá la ciudad de esta dirección."),
  countryId: z.string().trim().min(1),
  isDefault: z.boolean(),
  label: z.string().trim(),
  phone: z.string().trim().min(1, "Ingresá un teléfono de contacto."),
  postalCode: z.string().trim(),
  recipientName: z.string().trim().min(1, "Ingresá el nombre de contacto."),
  referenceNote: z.string().trim(),
  stateId: z
    .string()
    .trim()
    .min(1, "Indicá el departamento de esta dirección."),
  streetLine1: z.string().trim().min(1, "Ingresá la dirección principal."),
  streetLine2: z.string().trim(),
});

const defaultValues: AddressFormValues = {
  cityId: "",
  countryId: "country_py",
  isDefault: false,
  label: "",
  phone: "",
  postalCode: "",
  recipientName: "",
  referenceNote: "",
  stateId: "",
  streetLine1: "",
  streetLine2: "",
};

const sampleAddresses: CustomerAddressSummary[] = [
  {
    cityId: "city_py_fernando",
    countryId: "country_py",
    id: "address_home",
    isDefault: true,
    label: "Casa",
    phone: "0982 403 532",
    postalCode: "2309",
    recipientName: "Sebas Rojas",
    referenceNote: "Portón gris frente al surtidor.",
    stateId: "state_py_central",
    streetLine1: "Camino de la Torre 618",
    streetLine2: "Sabanera Dorado",
    summary: "Fernando de la Mora, Central",
  },
  {
    cityId: "city_py_asuncion",
    countryId: "country_py",
    id: "address_office",
    isDefault: false,
    label: "Oficina",
    phone: "0971 222 111",
    postalCode: "",
    recipientName: "Sebas Rojas",
    referenceNote: "Recepción del piso 4.",
    stateId: "state_py_capital",
    streetLine1: "Aviadores del Chaco 2450",
    streetLine2: "World Trade Center, Torre 3",
    summary: "Asunción",
  },
  {
    cityId: "city_py_luque",
    countryId: "country_py",
    id: "address_family",
    isDefault: false,
    label: "Familia",
    phone: "0991 888 222",
    postalCode: "",
    recipientName: "Sebastián Rojas",
    referenceNote: "",
    stateId: "state_py_central",
    streetLine1: "Paraje Ambay",
    streetLine2: "San Antonio",
    summary: "Luque, Central",
  },
];

const formNames = {
  cityId: "cityId",
  countryId: "countryId",
  isDefault: "isDefault",
  label: "label",
  phone: "phone",
  postalCode: "postalCode",
  recipientName: "recipientName",
  referenceNote: "referenceNote",
  stateId: "stateId",
  streetLine1: "streetLine1",
  streetLine2: "streetLine2",
} as const;

const meta = {
  title: "account/Direcciones",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryForm({
  children,
  defaultFormValues = defaultValues,
  injectErrors = false,
}: {
  children: (form: ReturnType<typeof useForm<AddressFormValues>>) => ReactNode;
  defaultFormValues?: AddressFormValues;
  injectErrors?: boolean;
}) {
  const form = useForm<AddressFormValues>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(addressFormSchema) as Resolver<AddressFormValues>,
  });

  useEffect(() => {
    if (!injectErrors) {
      return;
    }

    form.setError("recipientName", {
      message: "Ingresá el nombre de contacto.",
      type: "manual",
    });
    form.setError("phone", {
      message: "Ingresá un teléfono de contacto.",
      type: "manual",
    });
    form.setError("streetLine1", {
      message: "Ingresá la dirección principal.",
      type: "manual",
    });
  }, [form, injectErrors]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Form {...(form as any)}>
        <form>{children(form)}</form>
      </Form>
    </div>
  );
}

export const AddTile: Story = {
  render: () => (
    <div className="mx-auto max-w-md px-6 py-10">
      <AddressAddTile />
    </div>
  ),
};

export const DefaultAddressCard: Story = {
  render: () => (
    <div className="mx-auto max-w-md px-6 py-10">
      <AddressCard address={sampleAddresses[0]} />
    </div>
  ),
};

export const SecondaryAddressCard: Story = {
  render: () => (
    <div className="mx-auto max-w-md px-6 py-10">
      <AddressCard address={sampleAddresses[1]} />
    </div>
  ),
};

export const EmptyPanel: Story = {
  render: () => (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <AddressesPanel addresses={[]} />
    </div>
  ),
};

export const PopulatedPanel: Story = {
  render: () => (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <AddressesPanel
        addresses={sampleAddresses}
        pendingAddressIds={["address_office"]}
      />
    </div>
  ),
};

export const LongContentPanel: Story = {
  render: () => (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <AddressesPanel
        addresses={[
          {
            ...sampleAddresses[0],
            label: "Casa principal para recepciones nocturnas",
            referenceNote:
              "Entrar por el portón lateral después de las 18:00 y avisar por WhatsApp si el timbre no responde.",
            streetLine2:
              "Condominio Las Palmeras, bloque 7, departamento 4B, barrio con acceso controlado",
            summary:
              "Fernando de la Mora, Central, zona norte cerca de la plaza y del supermercado",
          },
        ]}
      />
    </div>
  ),
};

export const CreateForm: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <AddressFormSection
          actions={
            <>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
              <Button type="submit">Guardar dirección</Button>
            </>
          }
          control={form.control as any}
          names={formNames}
        />
      )}
    </StoryForm>
  ),
};

export const EditFormWithErrors: Story = {
  render: () => (
    <StoryForm
      defaultFormValues={{
        ...defaultValues,
        ...sampleAddresses[0],
        label: sampleAddresses[0].label ?? "",
        phone: sampleAddresses[0].phone ?? "",
        postalCode: sampleAddresses[0].postalCode ?? "",
        recipientName: sampleAddresses[0].recipientName ?? "",
        referenceNote: sampleAddresses[0].referenceNote ?? "",
        streetLine2: sampleAddresses[0].streetLine2 ?? "",
      }}
      injectErrors
    >
      {(form) => (
        <AddressFormSection
          actions={
            <>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </>
          }
          control={form.control as any}
          mode="edit"
          names={formNames}
        />
      )}
    </StoryForm>
  ),
};
