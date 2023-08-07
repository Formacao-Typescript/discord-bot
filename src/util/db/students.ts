import { MongoClient } from "deps.ts";

export type Student = {
  email: string;
  discordId: string;
  tier: string;
  createdAt: Date;
  linkedAt: Date | null;
};

export function getStudentRepository(client: MongoClient) {
  const db = client.database("discord");
  const students = db.collection<Student>("students");

  return {
    findByEmail: (email: string) => {
      return students.findOne({ email });
    },
    findByDiscordId: (discordId: string) => students.findOne({ discordId }),
    completeRegister: (email: string, discordId: string) => {
      return students.updateOne({ email }, { $set: { discordId, linkedAt: new Date() } });
    },
    existsByEmail: (email: string) =>
      students.countDocuments({ email, discordId: { $exists: true, $ne: "" } }).then((count) => count > 0),
    existsByDiscordId: (discordId: string) => students.countDocuments({ discordId }).then((count) => count > 0),
    preRegister: (email: string, tier = "free") =>
      students.updateOne({ email }, { email, discordId: "", tier, createdAt: new Date() }, { upsert: true }),
    findPreRegistered: (email: string) => students.findOne({ email, discordId: "" }),
    removeByEmail: (email: string) => students.deleteOne({ email }),
    unlinkByDiscordId: (discordId: string) =>
      students.updateOne({ discordId }, { $set: { discordId: "", linkedAt: null } }),
  };
}

export type StudentRepository = ReturnType<typeof getStudentRepository>;
