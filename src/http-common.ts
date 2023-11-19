import axios from "axios";

export const BASE_URL = "//localhost:4000";
export const SOCKET_URL = `ws:${BASE_URL}`;

export default axios.create({
  baseURL: `http:${BASE_URL}/api`,
  headers: {
    "Content-type": "application/json",
  },
});
