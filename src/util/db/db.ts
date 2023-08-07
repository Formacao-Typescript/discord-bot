import { MongoClient } from "deps.ts";
import { getConfig } from "../config.ts";
import { ConfirmationRepository, getConfirmationRepository } from "./confirmation.ts";
import { EventsRepository, getEventsRepository } from "./events.ts";
import { getRolesRepository, RolesRepository } from "./roles.ts";
import { getStudentRepository, StudentRepository } from "./students.ts";

const config = await getConfig();

export type Storage = {
  students: StudentRepository;
  roles: RolesRepository;
  events: EventsRepository;
  confirmation: ConfirmationRepository;
};

const client = new MongoClient({
  dataSource: "Cluster0",
  auth: {
    apiKey: config.atlasApiKey,
  },
  endpoint: config.atlasEndpoint,
});

let storage: Storage;

export const getStorage = (): Storage => {
  if (!storage) {
    storage = {
      students: getStudentRepository(client),
      roles: getRolesRepository(client),
      events: getEventsRepository(client),
      confirmation: getConfirmationRepository(client),
    };
  }

  return storage;
};
