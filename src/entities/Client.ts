import { RestClientV5 } from "bybit-api";
import { BYBIT_KEY, BYBIT_SECRET } from "../constants";

export const client = new RestClientV5({
  key: BYBIT_KEY,
  secret: BYBIT_SECRET,
  enable_time_sync: true,
});
