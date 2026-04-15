import { database, isUniqueConstraintError, schema } from "@repo/database";
import { eq } from "drizzle-orm";
import { log } from "@repo/observability/log";

interface BuyerUserRecord {
  customerId: string | null;
  email: string;
  id: string;
  image: string | null;
  name: string | null;
}

export interface CustomerProfileRecord {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  userId: string | null;
}

const getBuyerUser = async (
  userId: string
): Promise<BuyerUserRecord | null> => {
  const [user] = await database
    .select({
      customerId: schema.user.customerId,
      email: schema.user.email,
      id: schema.user.id,
      image: schema.user.image,
      name: schema.user.name,
    })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1);

  return user ?? null;
};

const getCustomerProfileById = async (customerId: string) => {
  const [customerProfile] = await database
    .select({
      email: schema.customerProfile.email,
      id: schema.customerProfile.id,
      image: schema.customerProfile.image,
      name: schema.customerProfile.name,
      userId: schema.customerProfile.userId,
    })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.id, customerId))
    .limit(1);

  return customerProfile ?? null;
};

const getCustomerProfileByUserId = async (userId: string) => {
  const [customerProfile] = await database
    .select({
      email: schema.customerProfile.email,
      id: schema.customerProfile.id,
      image: schema.customerProfile.image,
      name: schema.customerProfile.name,
      userId: schema.customerProfile.userId,
    })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.userId, userId))
    .limit(1);

  return customerProfile ?? null;
};

const getCustomerProfileByEmail = async (email: string) => {
  const [customerProfile] = await database
    .select({
      email: schema.customerProfile.email,
      id: schema.customerProfile.id,
      image: schema.customerProfile.image,
      name: schema.customerProfile.name,
      userId: schema.customerProfile.userId,
    })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.email, email))
    .limit(1);

  return customerProfile ?? null;
};

const resolveTargetCustomerProfile = async (
  user: BuyerUserRecord
): Promise<CustomerProfileRecord | null> => {
  if (user.customerId) {
    return getCustomerProfileById(user.customerId);
  }

  const linkedByUserId = await getCustomerProfileByUserId(user.id);

  if (linkedByUserId) {
    return linkedByUserId;
  }

  return getCustomerProfileByEmail(user.email);
};

const createCustomerProfileForUser = async (user: BuyerUserRecord) => {
  try {
    const [customerProfile] = await database
      .insert(schema.customerProfile)
      .values({
        email: user.email,
        image: user.image,
        name: user.name,
        userId: user.id,
      })
      .returning({
        email: schema.customerProfile.email,
        id: schema.customerProfile.id,
        image: schema.customerProfile.image,
        name: schema.customerProfile.name,
        userId: schema.customerProfile.userId,
      });

    return customerProfile;
  } catch (error) {
    if (!isUniqueConstraintError(error, "CustomerProfile_email_key")) {
      throw error;
    }

    return getCustomerProfileByEmail(user.email);
  }
};

const refreshCustomerProfileMirror = async (
  user: BuyerUserRecord,
  customerProfile: CustomerProfileRecord
) => {
  const [updatedCustomerProfile] = await database
    .update(schema.customerProfile)
    .set({
      email: user.email,
      image: user.image ?? customerProfile.image,
      name: user.name ?? customerProfile.name,
      updatedAt: new Date(),
      userId: customerProfile.userId ?? user.id,
    })
    .where(eq(schema.customerProfile.id, customerProfile.id))
    .returning({
      email: schema.customerProfile.email,
      id: schema.customerProfile.id,
      image: schema.customerProfile.image,
      name: schema.customerProfile.name,
      userId: schema.customerProfile.userId,
    });

  return updatedCustomerProfile;
};

const attachCustomerProfileToUser = async (
  userId: string,
  customerId: string
) => {
  await database
    .update(schema.user)
    .set({
      customerId,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, userId));
};

export const syncCustomerProfileForUser = async (userId: string) => {
  const user = await getBuyerUser(userId);

  if (!user) {
    return null;
  }

  let customerProfile = await resolveTargetCustomerProfile(user);

  if (!customerProfile) {
    customerProfile = await createCustomerProfileForUser(user);
  } else if (customerProfile.userId && customerProfile.userId !== user.id) {
    log.warn("Customer profile email already belongs to another auth user", {
      customerId: customerProfile.id,
      existingUserId: customerProfile.userId,
      userEmail: user.email,
      userId: user.id,
    });

    return customerProfile;
  } else {
    customerProfile = await refreshCustomerProfileMirror(user, customerProfile);
  }

  if (customerProfile && user.customerId !== customerProfile.id) {
    await attachCustomerProfileToUser(user.id, customerProfile.id);
  }

  return customerProfile;
};
