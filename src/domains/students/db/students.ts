import { Collection, MongoClient } from "deps.ts";
import { createStudent, Student } from "../schemas/student.ts";
import { Storage as GlobalStorage } from "../../../common/db/db.ts";

function hydrateStudent(students: Collection<Student>) {
  return (student: Student | null) => {
    if (!student) return null;
    return {
      ...student,
      remove: () => students.deleteOne({ email: student.email }),
      addTags: async (...tags: string[]) => {
        await students.updateOne({ email: student.email }, { $push: { tags: { $each: tags } } });
        student.tags.push(...tags);
      },
      removeTags: async (...tags: string[]) => {
        await students.updateOne({ email: student.email }, { $pullAll: { tags: tags } });
        student.tags = student.tags.filter((tag) => !tags.includes(tag));
      },
      strike: () =>
        students.updateOne(
          { email: student.email },
          { $inc: { "discord.strikes": 1 }, $set: { lastStrike: new Date() } },
        ),
      remind: () =>
        students.updateOne(
          { email: student.email },
          { $inc: { "discord.reminders": 1 }, $set: { lastReminder: new Date() } },
        ),
      setInviteLink: (inviteLink: string) =>
        students.updateOne(
          { email: student.email },
          { $set: { "discord.inviteLink": inviteLink } },
        ),
      linkDiscord: (discordId: string) =>
        students.updateOne(
          { email: student.email },
          { $set: { "discord.id": discordId, "discord.linkedAT": new Date() } },
        ),
      unlink: () => students.updateOne({ email: student.email }, { $set: { "discord.id": null } }),
      completeWelcomeEmail: () => students.updateOne({ email: student.email }, { $set: { welcomeEmailSent: true } }),
    };
  };
}

export type HydratedStudent = ReturnType<ReturnType<typeof hydrateStudent>>;

export function getStudentRepository(client: MongoClient, globalStorage: GlobalStorage) {
  const db = client.database("discord");
  const students = db.collection<Student>("students");
  const hydrate = hydrateStudent(students);

  return {
    hydrate,
    ...globalStorage.students,
    updateByEmail: (email: string, student: Partial<Student>) => students.updateOne({ email }, { $set: student }),
    setDiscordLinkByEmail: (email: string, discordLink: string) =>
      students.updateOne({ email }, { $set: { "discord.inviteLink": discordLink } }),
    removeByEmail: (email: string) => students.deleteOne({ email }),
    linkDiscord: (email: string, discordId: string) => {
      return students
        .updateOne(
          { email },
          { $set: { "discord.id": discordId, "discord.linkedAt": new Date() } },
        );
    },
    create: async (name: string, email: string, tags: string[]) => {
      const existingStudent = await students.findOne({ email });
      if (existingStudent) return hydrate(existingStudent);

      const student = createStudent(name, email, tags);
      await students.insertOne(student);
      return hydrate(student);
    },
    unlinkByDiscordId: (discordId: string) => {
      return students
        .updateOne(
          { discordId },
          { $set: { "discord.id": null } },
        );
    },
  };
}

export type StudentRepository = ReturnType<typeof getStudentRepository>;
