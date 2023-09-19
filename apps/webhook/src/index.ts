import { Logging } from "@google-cloud/logging";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { EnrichedTransaction } from "helius-sdk";
import express, { Router } from "express";

const PROJECT_ID = process.env.PROJECT_ID!;

const logging = new Logging({ projectId: PROJECT_ID });
const logger = logging.log(PROJECT_ID);
const metadata = {
  labels: {
    app: PROJECT_ID,
  },
};

const log = async (
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

const getHeliusAuthSecret = async () => {
  const client = new SecretManagerServiceClient();
  console.log(PROJECT_ID);
  const [response] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/helius-auth/versions/latest`,
  });
  const secretString = response?.payload?.data?.toString();
  return secretString;
};

const app = express();
app.use(express.json());
app.post("/helius", async (req, res) => {
  const secret = await getHeliusAuthSecret();
  await log("Secrets", { secret, headers: req.headers.authorization });
  if (req.headers?.authorization !== secret) {
    return res.status(401).send("Authorization Error");
  }
  const body = req.body as { "0": EnrichedTransaction };
  const enrichedTransaction = body["0"];
  await log("webhook", enrichedTransaction);
  return res.status(200).send("");
});

app.listen(8080, () => {
  console.log("listening on 8080");
});
