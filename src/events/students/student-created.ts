import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";
import { Student } from "../../domains/students/schemas/student.ts";

export const [StudentCreatedEvent, createStudentCreatedEvent] = defineEvent(
  "student_created",
  z.object({
    student: Student,
  }),
);
