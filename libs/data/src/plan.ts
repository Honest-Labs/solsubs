import { getMongoClient } from "../../environment/src";

export type Term =
  | "oneSecond"
  | "thirtySeconds"
  | "oneWeek"
  | "thirtyDays"
  | "oneYear";

export interface Plan {
  splToken: string;
  code: string;
  owner: string;
  price: number;
  term: Term;
  account: string;
  createdAt: Date;
}

export const getPlanCol = async () => {
  const client = await getMongoClient();
  const col = client.collection<Plan>("plans");
  await col.createIndex({
    splToken: 1,
    code: 1,
    owner: 1,
    createdAt: 1,
  });

  return col;
};
