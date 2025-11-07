import bcrypt from "bcryptjs";
import User from "../models/User";

export async function provisionCustomerUsers(tenantId: string, integrationId: number, customers: any[]) {
  await Promise.all(customers.map(async c => {
    const customerId = c.Id ?? c.ID ?? c.CustomerId;
    const username = c.Code?.toString();
    if (!username) return;
    const update: any = {
      tenantId,
      username,
      role: "customer",
      customerId,
      phoneNumber: c.PhoneNumber,
      isActive: true,
      maxDevices: 2,
      integrationId
    };

    const existing = await User.findOne({ tenantId, username });
    if (!existing) {
      const passwordHash = await bcrypt.hash(username, 10);
      await User.create({
        ...update,
        passwordHash,
        devices: []
      });
    } else {
      if (!existing.passwordHash) {
        existing.passwordHash = await bcrypt.hash(username, 10);
      }
      existing.customerId = customerId;
      existing.phoneNumber = c.PhoneNumber;
      if (!existing.integrationId) existing.integrationId = integrationId;
      existing.role = "customer";
      existing.isActive = true;
      await existing.save();
    }
  }));
}

