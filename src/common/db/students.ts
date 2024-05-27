import { MongoClient } from "deps.ts";
import { Student } from "../../domains/students/schemas/student.ts";

export function getStudentRepository(client: MongoClient) {
  const db = client.database("discord");
  const students = db.collection<Student>("students");

  return {
    findByEmail: (email: string) => students.findOne({ email }).catch(() => null),
    findByDiscordId: (discordId: string) => students.findOne({ discordId }),
    existsByDiscordId: (discordId: string) => students.countDocuments({ discordId }).then((count) => count > 0),
    findPreRegistered: (email: string) => students.findOne({ email, "discord.id": null }),
    existsByEmail: (email: string) => {
      return students
        .countDocuments({ email, "discord.id": null })
        .then((count) => count > 0);
    },
    findWithoutDiscord: async function* (): AsyncGenerator<Student, null, unknown> {
      let cursor = 0;
      let result: Student[];

      do {
        result = await students.find({ "discord.id": null }, {
          limit: 1,
          skip: cursor++,
        });
        if (result.length > 0) yield result[0];
      } while (result.length > 0);

      return null;
    },
    list: async function* (filter: Partial<Student>): AsyncGenerator<Student, null, unknown> {
      let cursor = 0;
      let result: Student[];

      do {
        result = await students.find(filter, { limit: 1, skip: cursor++ });
        if (result.length > 0) yield result[0];
      } while (result.length > 0);

      return null;
    },
  };
}

export type StudentRepository = ReturnType<typeof getStudentRepository>;
