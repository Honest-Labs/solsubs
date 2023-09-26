import { Logging } from "@google-cloud/logging";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { MongoClient } from "mongodb";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  AnchorProvider,
  BorshCoder,
  Program,
  Wallet,
} from "@project-serum/anchor";
import { SubscriptionProgram } from "./types";
import admin, { ServiceAccount } from "firebase-admin";
export * from "./types";
export const PROJECT_ID = process.env.PROJECT_ID!;

export const programId = new PublicKey(
  "6qMvvisbUX3Co1sZa7DkyCXF8FcsTjzKSQHcaDoqSLbw"
);

const logging = new Logging({ projectId: PROJECT_ID });
const logger = logging.log(PROJECT_ID);
const metadata = {
  labels: {
    app: PROJECT_ID,
  },
};

export const log = async (
  message: string,
  payload: Record<string, any> = {},
  error = false
) => {
  if (PROJECT_ID === "local") {
    console.log(message, payload);
  } else {
    try {
      const entry = logger.entry(metadata, {
        payload: { ...payload },
        message,
      });
      if (error) {
        await logger.error(entry);
      } else {
        await logger.write(entry);
      }
    } catch (e) {}
  }
};

let _mongoClient: MongoClient;

const getMongoSecret = async () => {
  const client = new SecretManagerServiceClient();
  console.log(PROJECT_ID);
  const [response] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/mongo-password/versions/latest`,
  });
  const secretString = response?.payload?.data?.toString();
  return secretString;
};

export const getMongoClient = async () => {
  if (!_mongoClient) {
    const creds = {
      username: "admin",
      password: await getMongoSecret(),
    };
    _mongoClient = new MongoClient(
      `mongodb+srv://${creds.username}:${creds.password}@serverlessinstance0.gnjmbie.mongodb.net/?retryWrites=true&w=majority`
    );
    try {
      _mongoClient = await _mongoClient.connect();
    } catch (e) {
      await log("client already connected", { e });
    }
  }
  return _mongoClient.db(PROJECT_ID === "solsubs-dev" ? "dev" : "prod");
};

const url =
  PROJECT_ID === "solsubs-prod"
    ? "https://rpc.helius.xyz/?api-key=97602bb0-7a52-4f03-ae6a-3527f32b0f09"
    : "https://devnet.helius-rpc.com/?api-key=0c7e899d-480b-4f6f-9d6d-6e980dad3442";

export const connection = new Connection(url, "confirmed");

let _program: Program<SubscriptionProgram>;

export const getProgram = async (keypair = Keypair.generate()) => {
  if (!_program) {
    const provider = new AnchorProvider(connection, new Wallet(keypair), {});
    const idl = await Program.fetchIdl(programId, provider);
    _program = new Program(
      idl!,
      programId,
      provider
    ) as unknown as Program<SubscriptionProgram>;
  }
  return _program;
};

const getFirebaseSecret = async () => {
  const client = new SecretManagerServiceClient();
  console.log(PROJECT_ID);
  const [response] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/firebase/versions/latest`,
  });
  const secretString = response?.payload?.data?.toString();
  return JSON.parse(secretString!) as ServiceAccount;
};

export const initFirebase = async () => {
  if (!admin.apps.length) {
    const sa = await getFirebaseSecret();
    admin.initializeApp();
    admin.initializeApp({
      credential: admin.credential.cert(sa as ServiceAccount),
    });
  }
};
