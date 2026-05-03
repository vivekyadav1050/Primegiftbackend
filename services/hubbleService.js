import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

const clientId = process.env.HUBBLE_CLIENT_ID;
const clientSecret = process.env.HUBBLE_CLIENT_SECRET;

const BASE_URL = process.env.HUBBLE_BASE_URL;

let Hubbletoken = null;
let tokenExpiry = null;

export async function getValidToken() {
  if (!Hubbletoken || new Date() >= tokenExpiry) {
    const response =await axios.post(
  `${BASE_URL}/v1/partners/auth/login`,
  { clientId, clientSecret }
);

    Hubbletoken = response.data.token;
    tokenExpiry = new Date(Date.now() + response.data.expiresInSecs * 1000);
  }

  return Hubbletoken;
}
export {BASE_URL};