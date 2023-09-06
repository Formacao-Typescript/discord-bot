import { MongoClient } from "deps.ts";

export type Student = {
  email: string;
  discordId: string;
  tier: string;
  createdAt: Date;
  linkedAt: Date | null;
  welcomeEmailSent: boolean;
};

export function getStudentRepository(client: MongoClient) {
  const db = client.database("discord");
  const students = db.collection<Student>("students");

  return {
    findByEmail: (email: string) => {
      return students.findOne({ email }).catch(() => null);
    },
    findByDiscordId: (discordId: string) => students.findOne({ discordId }),
    completeRegister: (email: string, discordId: string) => {
      return students.updateOne({ email }, { $set: { discordId, linkedAt: new Date() } });
    },
    existsByEmail: (email: string) =>
      students.countDocuments({ email, discordId: { $exists: true, $ne: "" } }).then((count) => count > 0),
    existsByDiscordId: (discordId: string) => students.countDocuments({ discordId }).then((count) => count > 0),
    preRegister: (email: string, tier = "free") =>
      students.updateOne({ email }, {
        email,
        discordId: "",
        tier,
        createdAt: new Date(),
      }, {
        upsert: true,
      }),
    findPreRegistered: (email: string) => students.findOne({ email, discordId: "" }),
    removeByEmail: (email: string) => students.deleteOne({ email }),
    unlinkByDiscordId: (discordId: string) =>
      students.updateOne({ discordId }, { $set: { discordId: "", linkedAt: null } }),
    completeWelcomeEmail: (email: string) => students.updateOne({ email }, { $set: { welcomeEmailSent: true } }),
  };
}

export type StudentRepository = ReturnType<typeof getStudentRepository>;
