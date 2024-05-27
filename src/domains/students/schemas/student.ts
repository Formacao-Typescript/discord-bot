import { z } from "deps.ts";

export const StudentDiscordData = z.object({
  id: z.string().nullable(),
  linkedAt: z.date().nullable(),
  strikes: z.number(),
  lastStrike: z.date().nullable(),
  inviteLink: z.string().nullable(),
  reminders: z.number(),
  lastReminder: z.date().nullable(),
}).default({
  id: null,
  linkedAt: null,
  strikes: 0,
  lastStrike: null,
  inviteLink: null,
  reminders: 0,
  lastReminder: null,
});

export const Student = z.object({
  name: z.string(),
  email: z.string().email(),
  discord: StudentDiscordData,
  tags: z.string().array().default([]),
  createdAt: z.date(),
  welcomeEmailSent: z.boolean(),
});

export type Student = z.infer<typeof Student>;

export const createStudent = (name: string, email: string, tags: string[]): Student => ({
  name,
  email,
  discord: {
    id: null,
    linkedAt: null,
    strikes: 0,
    lastStrike: null,
    inviteLink: null,
    reminders: 0,
    lastReminder: null,
  },
  tags,
  createdAt: new Date(),
  welcomeEmailSent: false,
});
