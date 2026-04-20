import { database, schema } from "../packages/database/client.js";

const paraguayGeography: Record<string, string[]> = {
  Concepción: [
    "Arroyito",
    "Azotey",
    "Belén",
    "Concepción",
    "Horqueta",
    "Itacuá",
    "Loreto",
    "Paso Barreto",
    "Paso Horqueta",
    "San Alfredo",
    "San Carlos del Apa",
    "San Lázaro",
    "Sargento José Félix López",
    "Yby Yaú",
  ],
  "San Pedro": [
    "Antequera",
    "Capiibary",
    "Choré",
    "General Elizardo Aquino",
    "General Isidoro Resquín",
    "Guayaibí",
    "Itacurubí del Rosario",
    "Liberación",
    "Lima",
    "Nueva Germania",
    "San José del Rosario",
    "San Estanislao",
    "San Pablo",
    "San Pedro de Ycuamandiyú",
    "San Vicente Pancholo",
    "Santa Rosa del Aguaray",
    "Tacuatí",
    "Unión",
    "Veinticinco de Diciembre",
    "Villa del Rosario",
    "Yataity del Norte",
    "Yrybucuá",
  ],
  Cordillera: [
    "Altos",
    "Arroyos y Esteros",
    "Atyrá",
    "Caacupé",
    "Caraguatay",
    "Emboscada",
    "Eusebio Ayala",
    "Isla Pucú",
    "Itacurubí de la Cordillera",
    "Juan de Mena",
    "Loma Grande",
    "Mbocayaty del Yhaguy",
    "Nueva Colombia",
    "Piribebuy",
    "Primero de Marzo",
    "San Bernardino",
    "San José Obrero",
    "Santa Elena",
    "Tobatí",
    "Valenzuela",
  ],
  Guairá: [
    "Borja",
    "Capitán Mauricio José Troche",
    "Coronel Martínez",
    "Doctor Botrell",
    "Félix Pérez Cardozo",
    "General Eugenio Alejandrino Garay",
    "Independencia",
    "Itapé",
    "Iturbe",
    "José A. Fassardi",
    "Mbocayaty del Guairá",
    "Natalicio Talavera",
    "Ñumí",
    "Paso Yobái",
    "San Salvador",
    "Tebicuary",
    "Villarrica",
    "Yataity del Guairá",
  ],
  Caaguazú: [
    "Caaguazú",
    "Carayaó",
    "Coronel Oviedo",
    "Doctor Cecilio Báez",
    "Doctor Juan Eulogio Estigarribia",
    "Doctor Juan Manuel Frutos",
    "José Domingo Ocampos",
    "La Pastora",
    "Mariscal Francisco Solano López",
    "Nueva Londres",
    "Nueva Toledo",
    "Raúl Arsenio Oviedo",
    "Regimiento de Infantería Tres Corrales",
    "Repatriación",
    "San Joaquín",
    "San José de los Arroyos",
    "Santa Rosa del Mbutuy",
    "Simón Bolívar",
    "Tembiaporá",
    "Tres de Febrero",
    "Vaquería",
    "Yhú",
  ],
  Caazapá: [
    "Abaí",
    "Buena Vista",
    "Caazapá",
    "Doctor Moisés Santiago Bertoni",
    "Fulgencio Yegros",
    "General Higinio Morínigo",
    "Maciel",
    "San Juan Nepomuceno",
    "Tavaí",
    "Tres de Mayo",
    "Yuty",
  ],
  Itapúa: [
    "Alto Verá",
    "Bella Vista",
    "Cambyretá",
    "Capitán Meza",
    "Capitán Miranda",
    "Carlos Antonio López",
    "Carmen del Paraná",
    "Coronel José Félix Bogado",
    "Edelira",
    "Encarnación",
    "Fram",
    "General Artigas",
    "General Delgado",
    "Hohenau",
    "Itapúa Poty",
    "Jesús de Tavarangüé",
    "José Leandro Oviedo",
    "La Paz",
    "Mayor Julio Dionisio Otaño",
    "Natalio",
    "Nueva Alborada",
    "Obligado",
    "Pirapó",
    "San Cosme y Damián",
    "San Juan del Paraná",
    "San Pedro del Paraná",
    "San Rafael del Paraná",
    "Tomás Romero Pereira",
    "Trinidad",
    "Yatytay",
  ],
  Misiones: [
    "Ayolas",
    "San Ignacio Guazú",
    "San Juan Bautista",
    "San Miguel",
    "San Patricio",
    "Santa María de Fe",
    "Santa Rosa de Lima",
    "Santiago",
    "Villa Florida",
    "Yabebyry",
  ],
  Paraguarí: [
    "Acahay",
    "Caapucú",
    "Carapeguá",
    "Escobar",
    "General Bernardino Caballero",
    "La Colmena",
    "María Antonia",
    "Mbuyapey",
    "Paraguarí",
    "Pirayú",
    "Quiindy",
    "Quyquyhó",
    "San Roque González de Santa Cruz",
    "Sapucai",
    "Tebicuarymí",
    "Yaguarón",
    "Ybycuí",
    "Ybytymí",
  ],
  "Alto Paraná": [
    "Ciudad del Este",
    "Doctor Juan León Mallorquín",
    "Doctor Raúl Peña",
    "Domingo Martínez de Irala",
    "Hernandarias",
    "Iruña",
    "Itakyry",
    "Juan Emiliano O'Leary",
    "Los Cedrales",
    "Mbaracayú",
    "Minga Guazú",
    "Minga Porá",
    "Naranjal",
    "Ñacunday",
    "Presidente Franco",
    "San Alberto",
    "San Cristóbal",
    "Santa Fe del Paraná",
    "Santa Rita",
    "Santa Rosa del Monday",
    "Tavapy",
    "Yguazú",
  ],
  Central: [
    "Areguá",
    "Capiatá",
    "Fernando de la Mora",
    "Guarambaré",
    "Itá",
    "Itauguá",
    "Julián Augusto Saldívar",
    "Lambaré",
    "Limpio",
    "Luque",
    "Mariano Roque Alonso",
    "Nueva Italia",
    "Ñemby",
    "San Antonio",
    "San Lorenzo",
    "Villa Elisa",
    "Villeta",
    "Ypacaraí",
    "Ypané",
  ],
  Ñeembucú: [
    "Alberdi",
    "Cerrito",
    "Desmochados",
    "General José Eduvigis Díaz",
    "Guazú Cuá",
    "Humaitá",
    "Isla Umbú",
    "Laureles",
    "Mayor José Martínez",
    "Paso de Patria",
    "Pilar",
    "San Juan Bautista de Ñeembucú",
    "Tacuaras",
    "Villa Franca",
    "Villa Oliva",
    "Villalbín",
  ],
  Amambay: [
    "Bella Vista Norte",
    "Capitán Bado",
    "Cerro Corá",
    "Karapaí",
    "Pedro Juan Caballero",
    "Zanja Pytá",
  ],
  Canindeyú: [
    "Corpus Christi",
    "Curuguaty",
    "General Francisco Caballero Álvarez",
    "Itanará",
    "Katueté",
    "La Paloma del Espíritu Santo",
    "Laurel",
    "Maracaná",
    "Nueva Esperanza",
    "Puerto Adela",
    "Salto del Guairá",
    "Villa Ygatimí",
    "Yasy Cañy",
    "Yby Pytá",
    "Ybyrarobaná",
    "Ypejhú",
  ],
  "Presidente Hayes": [
    "Benjamín Aceval",
    "Campo Aceval",
    "General José María Bruguez",
    "José Falcón",
    "Nanawa",
    "Nueva Asunción",
    "Puerto Pinasco",
    "Teniente Esteban Martínez",
    "Teniente Primero Manuel Irala Fernández",
    "Villa Hayes",
  ],
  Boquerón: [
    "Boquerón",
    "Filadelfia",
    "Loma Plata",
    "Mariscal José Félix Estigarribia",
  ],
  "Alto Paraguay": [
    "Bahía Negra",
    "Capitán Carmelo Peralta",
    "Fuerte Olimpo",
    "Puerto Casado",
  ],
  Asunción: ["Asunción"],
};

async function seedGeography() {
  console.log("Starting geography seed...");

  try {
    await database.transaction(async (tx: any) => {
      console.log("Cleaning up existing geography data...");
      await tx.delete(schema.customerAddress);
      await tx.delete(schema.deliveryInfo);
      await tx.delete(schema.city);
      await tx.delete(schema.state);
      await tx.delete(schema.country);

      console.log("Inserting country: Paraguay...");
      const [paraguay] = await tx
        .insert(schema.country)
        .values({
          name: "Paraguay",
          isoCode2: "PY",
          isoCode3: "PRY",
          isActive: true,
        })
        .returning();

      if (!paraguay) {
        throw new Error("Failed to insert Paraguay");
      }

      const departmentNames = Object.keys(paraguayGeography);

      console.log(`Inserting ${departmentNames.length} departments...`);
      const insertedStates = await tx
        .insert(schema.state)
        .values(
          departmentNames.map((name) => ({
            countryId: paraguay.id,
            name,
          }))
        )
        .returning();

      const stateIdByName = new Map(
        insertedStates.map((state: any) => [state.name, state.id])
      );

      const cityValues = Object.entries(paraguayGeography).flatMap(
        ([departmentName, cities]) => {
          const stateId = stateIdByName.get(departmentName);

          if (!stateId) {
            throw new Error(`Missing state id for ${departmentName}`);
          }

          return cities.map((name) => ({
            stateId,
            name,
          }));
        }
      );

      console.log(`Inserting ${cityValues.length} municipalities...`);
      await tx.insert(schema.city).values(cityValues);
    });

    console.log("Geography seed completed successfully!");
  } catch (error) {
    console.error("Error seeding geography:", error);
    process.exit(1);
  }
}

seedGeography();
