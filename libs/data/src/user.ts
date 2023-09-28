import { getMongoClient } from "@libs/environment";

export interface User {
  publicKey: string;
  createdAt: Date;
}

export interface UserVerificationMessage {
  publicKey: string;
  message: string;
  createdAt: Date;
}

export const getUserCol = async () => {
  const client = await getMongoClient();
  const col = client.collection<User>("users");
  await col.createIndex({
    publicKey: 1,
    createdAt: 1,
  });

  return col;
};

export const getUserVerificationMessageCol = async () => {
  const client = await getMongoClient();
  const col = client.collection<UserVerificationMessage>(
    "user-verification-messages"
  );
  await col.createIndex({
    publicKey: 1,
    createdAt: 1,
  });

  return col;
};
