import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";
import { Student } from "../../domains/students/schemas/student.ts";

export const [StudentTagsChangedEvent, createStudentTagsChangedEvent] = defineEvent(
  "student_tags_changed",
  z.object({
    student: Student,
    from: z.string().array(),
    to: z.string().array(),
    changeset: z.object({
      added: z.string().array(),
      removed: z.string().array(),
    }),
  }),
);
