import { MongoClient } from "deps.ts";
import { Collection } from "https://deno.land/x/atlas_sdk@v1.1.1/mod.ts";

export type Student = {
  email: string;
  discordId: string;
  tier: string;
  createdAt: Date;
  linkedAt: Date | null;
  welcomeEmailSent: boolean;
  strikes: number;
  lastStrike: Date | null;
  discordInviteLink: string | null;
  reminders: number;
  lastReminder: Date | null;
};

function createStudent(email: string, tier: string): Student {
  return {
    email,
    discordId: "",
    tier,
    createdAt: new Date(),
    linkedAt: null,
    lastStrike: null,
    strikes: 0,
    discordInviteLink: null,
    welcomeEmailSent: false,
    reminders: 0,
    lastReminder: null,
  };
}

function hydrateStudent(students: Collection<Student>) {
  return (student: Student) => ({
    ...student,
    remove: () => students.deleteOne({ email: student.email }),
    strike: () =>
      students.updateOne(
        { email: student.email },
        { $inc: { strikes: 1 }, $set: { lastStrike: new Date() } },
      ),
    remind: () =>
      students.updateOne(
        { email: student.email },
        { $inc: { reminders: 1 }, $set: { lastReminder: new Date() } },
      ),
    setInviteLink: (inviteLink: string) =>
      students.updateOne(
        { email: student.email },
        { $set: { discordInviteLink: inviteLink } },
      ),
    completeRegister: (discordId: string) =>
      students.updateOne(
        { email: student.email },
        { $set: { discordId, linkedAt: new Date() } },
      ),
    unlink: () => students.updateOne({ email: student.email }, { $set: { discordId: "", linkedAt: null } }),
    completeWelcomeEmail: () => students.updateOne({ email: student.email }, { $set: { welcomeEmailSent: true } }),
  });
}

export type HydratedStudent = ReturnType<ReturnType<typeof hydrateStudent>>;

export function getStudentRepository(client: MongoClient) {
  const db = client.database("discord");
  const students = db.collection<Student>("students");
  const hydrate = hydrateStudent(students);

  return {
    findByEmail: (email: string) => students.findOne({ email }).then(hydrate).catch(() => null),
    findByDiscordId: (discordId: string) => students.findOne({ discordId }).then(hydrate),
    removeByEmail: (email: string) => students.deleteOne({ email }),
    existsByDiscordId: (discordId: string) => students.countDocuments({ discordId }).then((count) => count > 0),
    findPreRegistered: (email: string) => students.findOne({ email, discordId: "" }).then(hydrate),
    completeRegister: (email: string, discordId: string) => {
      return students
        .updateOne(
          { email },
          { $set: { discordId, linkedAt: new Date() } },
        );
    },
    existsByEmail: (email: string) => {
      return students
        .countDocuments({ email, discordId: { $exists: true, $ne: "" } })
        .then((count) => count > 0);
    },
    preRegister: async (email: string, tier = "free") => {
      const student = createStudent(email, tier);
      await students.updateOne(student, { upsert: true });
      return hydrate(student);
    },
    unlinkByDiscordId: (discordId: string) => {
      return students
        .updateOne(
          { discordId },
          { $set: { discordId: "", linkedAt: null } },
        );
    },
    list: async function* (filter: Partial<Student>): AsyncGenerator<HydratedStudent, null, unknown> {
      let cursor = 0;
      let result: Student[];

      do {
        result = await students.find(filter, { limit: 1, skip: cursor++ });
        if (result.length > 0) yield hydrate(result[0]);
      } while (result.length > 0);

      return null;
    },
  };
}

export type StudentRepository = ReturnType<typeof getStudentRepository>;
