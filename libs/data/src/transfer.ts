import { getMongoClient } from "../../environment/src";

// from player to escrow for payment;
// transfers can be to escrow from the player for a refund,
// from escrow to the plan owner for a payout;
// from escrow to deployer for tax;
export interface Transfer {
  type: "tax" | "payment" | "refund" | "payout";
  from: string;
  to: string;
  amount: number;
  splToken: string;
  planId: string;
  subscriptionId: string;
  createdAt: Date;
  hash: string;
}

export const getTransferCol = async () => {
  const client = await getMongoClient();
  const col = client.collection<Transfer>("transfers");
  await col.createIndex({
    from: 1,
    to: 1,
    splToken: 1,
    planId: 1,
    subscriptionId: 1,
    hash: 1,
    createdAt: -1,
  });

  return col;
};
