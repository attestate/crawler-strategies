// @format
import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "call-block-logs";
const log = logger(name);
export const version = "0.1.0";

export function onClose() {
  log("closed");
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line, topic0, topic1) {
  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    log(err.toString());
    return;
  }

  let filter = true;
  if (topic0) {
    filter = (log) => log.topics[0] === topic0;
  } else if (topic0 && topic1) {
    filter = (log) => log.topics[0] === topic0 && log.topics[1] === topic1;
  }
  logs = logs.filter(filter);
  if (logs.length) {
    return JSON.stringify(logs);
  } else {
    return "";
  }
}
