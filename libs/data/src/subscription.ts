import { getMongoClient } from "../../environment/src";

type SubscriptionState =
  | "active"
  | "pendingCancellation"
  | "pastDue"
  | "closed";

export interface Subscription {
  planId: string;
  owner: string;
  planOwner: string;
  state: SubscriptionState;
  createdAt: Date;
  account: string;
  splToken: string;
  delegationAmount: number;
  nextTermDate: Date;
}

export const getSubscriptionCol = async () => {
  const client = await getMongoClient();
  const col = client.collection<Subscription>("subscriptions");
  await col.createIndex({
    planId: 1,
    owner: 1,
    planOwner: 1,
    nextTermDate: -1,
    createdAt: 1,
  });

  return col;
};
