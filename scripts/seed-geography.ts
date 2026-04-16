import { database, schema, sql } from "../packages/database/client";

async function seedGeography() {
  console.log("Starting geography seed...");

  try {
    // 1. Clean up existing data to ensure Paraguay is the only country
    // Order matters because of foreign key constraints
    console.log("Cleaning up existing geography data...");
    await database.delete(schema.customerAddress);
    await database.delete(schema.deliveryInfo);
    await database.delete(schema.city);
    await database.delete(schema.state);
    await database.delete(schema.country);

    // 2. Insert Paraguay
    console.log("Inserting country: Paraguay...");
    const [paraguay] = await database
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

    // 3. Insert Departments (States)
    const departments = [
      "Concepción",
      "San Pedro",
      "Cordillera",
      "Guairá",
      "Caaguazú",
      "Caazapá",
      "Itapúa",
      "Misiones",
      "Paraguarí",
      "Alto Paraná",
      "Central",
      "Ñeembucú",
      "Amambay",
      "Canindeyú",
      "Presidente Hayes",
      "Boquerón",
      "Alto Paraguay",
      "Asunción",
    ];

    console.log(`Inserting ${departments.length} departments...`);
    const stateValues = departments.map((name) => ({
      countryId: paraguay.id,
      name,
    }));

    await database.insert(schema.state).values(stateValues);

    // 4. Insert Cities for Central
    console.log("Inserting cities for Central...");
    const [centralState] = await database
      .select()
      .from(schema.state)
      .where(sql`${schema.state.name} = 'Central'`)
      .limit(1);

    if (!centralState) {
      throw new Error("Failed to find Central state for city seeding");
    }

    const [asuncionState] = await database
      .select()
      .from(schema.state)
      .where(sql`${schema.state.name} = 'Asunción'`)
      .limit(1);

    if (!asuncionState) {
      throw new Error("Failed to find Asunción state for city seeding");
    }

    const centralCities = [
      "Areguá",
      "Capiatá",
      "Fernando de la Mora",
      "Guarambaré",
      "Itá",
      "Itauguá",
      "J. Augusto Saldívar",
      "Lambaré",
      "Limpio",
      "Luque",
      "Mariano Roque Alonso",
      "Ñemby",
      "Nueva Italia",
      "San Antonio",
      "San Lorenzo",
      "Villa Elisa",
      "Villeta",
      "Ypacaraí",
      "Ypané",
    ];

    const asuncionCities = ["Capital"];

    const cityValues = centralCities.map((name) => ({
      stateId: centralState.id,
      name,
    }));

    await database.insert(schema.city).values(cityValues);

    console.log(
      `Successfully seeded ${centralCities.length} cities for Central.`
    );
    console.log("Geography seed completed successfully!");
  } catch (error) {
    console.error("Error seeding geography:", error);
    process.exit(1);
  }
}

seedGeography();
