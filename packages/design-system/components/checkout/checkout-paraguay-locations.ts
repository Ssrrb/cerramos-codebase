"use client";

const paraguayCityBarrios = {
  Asunción: [
    "Barrio Jara",
    "Bella Vista",
    "Las Lomas",
    "Mburicaó",
    "Obrero",
    "Recoleta",
    "San Vicente",
    "Santísima Trinidad",
    "Sajonia",
    "Villa Morra",
  ],
  Capiatá: [
    "Aldana Cañada",
    "Cañadita",
    "Kennedy",
    "Loma Barrero",
    "Posta Ybycuá",
    "Rojas Cañada",
    "San Jorge",
    "San Miguel",
    "Toledo Cañada",
    "Yataity",
  ],
  Encarnación: [
    "Buena Vista",
    "Centro",
    "Ciudad Nueva",
    "Ka'aguy Rory",
    "Pacú Cuá",
    "Quiteria",
    "Sagrada Familia",
    "San Isidro",
    "San Pedro",
    "Santa María",
  ],
  "Fernando de la Mora": [
    "Bernardino Caballero",
    "Kokue Guasu",
    "Laguna Satí",
    "Mcal. Estigarribia",
    "Pitiantuta",
    "San Antonio",
    "Santa Teresa",
    "Villa Ofelia",
    "Zavala Cué",
  ],
  Limpio: [
    "Aguapey",
    "Costa Azul",
    "Isla Aranda",
    "Mocipar",
    "Piquete Cué",
    "Rincón del Peñón",
    "Salado",
    "San Francisco",
    "Santa Lucía",
  ],
  Luque: [
    "3 de Mayo",
    "Bella Vista",
    "Cañada Garay",
    "Centro",
    "Isla Bogado",
    "Loma Merlo",
    "Maramburé",
    "Mora Cué",
    "Ñu Guasu",
    "Yka'a",
  ],
  Mariano: [
    "Caaguazú",
    "Central",
    "Lotes",
    "Mariano Centro",
    "Mbocayaty",
    "San Blas",
    "San Luis",
    "Santa Clara",
    "Villa Amelia",
  ],
  Ñemby: [
    "Caaguazú",
    "Cañadita",
    "Centro",
    "Pa'i Ñu",
    "Rincón",
    "San Antonio",
    "San Carlos",
    "San Miguel",
    "Vista Alegre",
  ],
  "San Antonio": [
    "Achucarro",
    "Cerrito",
    "Centro",
    "Las Garzas",
    "María Auxiliadora",
    "Naranjaty",
    "San Blas",
    "San Jorge",
    "Villa Amelia",
  ],
  "San Lorenzo": [
    "Barcequillo",
    "Capellanía",
    "Centro",
    "La Encarnación",
    "Lote Guasu",
    "Reducto",
    "San Isidro",
    "Santa Lucía",
    "Villa Universitaria",
  ],
  "Villa Elisa": [
    "29 de Septiembre",
    "Centro",
    "Gloria María",
    "Mbocayaty",
    "Picada",
    "Remansito",
    "Sol de América",
    "Tres Bocas",
    "Ypati",
  ],
} as const satisfies Record<string, readonly string[]>;

type ParaguayCity = keyof typeof paraguayCityBarrios;

interface CheckoutLocationOption {
  label: string;
  value: string;
}

const checkoutParaguayCityOptions: CheckoutLocationOption[] = Object.keys(
  paraguayCityBarrios
)
  .sort((left, right) => left.localeCompare(right, "es-PY"))
  .map((city) => ({
    label: city,
    value: city,
  }));

const getCheckoutParaguayBarrioOptions = (
  city: string | undefined
): CheckoutLocationOption[] => {
  if (!city) {
    return [];
  }

  const barrios = paraguayCityBarrios[city as ParaguayCity];

  if (!barrios) {
    return [];
  }

  return [...barrios]
    .sort((left, right) => left.localeCompare(right, "es-PY"))
    .map((barrio) => ({
      label: barrio,
      value: barrio,
    }));
};

export {
  checkoutParaguayCityOptions,
  getCheckoutParaguayBarrioOptions,
  paraguayCityBarrios,
};
export type { CheckoutLocationOption, ParaguayCity };
