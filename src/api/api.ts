import axios from "axios";
import https from "https";
import env from "env";

const api = axios.create({
  baseURL: env.CDN_BASE_URL,
  httpsAgent: new https.Agent({ keepAlive: true })
});

export default api;
