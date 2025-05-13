import dotenv from "dotenv";

dotenv.config();

const {
  BOT_TOKEN,
  CDN_BASE_URL,
  ENVIRONMENT,
} = process.env;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing!");
}

if (!CDN_BASE_URL) {
  throw new Error("CDN_BASE_URL is missing!");
}

if (!ENVIRONMENT) {
  throw new Error("ENVIRONMENT is missing!");
}

export default {
  BOT_TOKEN,
  CDN_BASE_URL,
  ENVIRONMENT,
};
