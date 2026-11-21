import axios from "axios";
import { environment } from "@/environment/environment";

const baseURL = import.meta.env.VITE_API_BASE_URL || `${environment.serverURL}/api/`;

export const httpInstance = axios.create({ baseURL });

const token = window.localStorage.getItem("auth-token");
const saasid = window.localStorage.getItem("saasid");
if (token) httpInstance.defaults.headers["auth-token"] = token;
if (saasid) httpInstance.defaults.headers.saasid = saasid;

export const setAuthToken = (nextToken, nextSaasId) => {
  if (nextToken) httpInstance.defaults.headers["auth-token"] = nextToken;
  if (nextSaasId) httpInstance.defaults.headers.saasid = nextSaasId;
};
