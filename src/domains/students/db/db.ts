import { client, getStorage as getGlobalStorage, Storage as GlobalStorage } from "../../../common/db/db.ts";
import { getStudentRepository } from "./students.ts";

type Storage = GlobalStorage & {
  students: ReturnType<typeof getStudentRepository>;
};

let storage: Storage;

export const getStorage = (): Storage => {
  const globalStorage = getGlobalStorage();
  if (!storage) {
    storage = {
      ...globalStorage,
      students: getStudentRepository(client, globalStorage),
    };
  }

  return storage;
};
