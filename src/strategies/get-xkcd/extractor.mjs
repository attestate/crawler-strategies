import Ajv from "ajv";

import logger from "../../logger.mjs";
import { schema } from "./schema.mjs";

const version = "0.0.1";
export const name = "get-xkcd";
const log = logger(name);
const MAX_PAGE = 19;
const templateURI = (num) => `https://xkcd.com/${num}/info.0.json`;

const validator = new Ajv();
const validate = validator.compile(schema);

export function init(start = 1) {
  return {
    write: null,
    messages: [
      {
        type: "https",
        version,
        options: {
          url: templateURI(start),
          method: "GET",
        },
      },
    ],
  };
}

export function update(message) {
  // TODO: There's a bug in @neume-network/extraction-worker that doesn't allow
  // us to get back errors.
  if (message.error) {
    log(message.error);

    return {
      write: null,
      messages: [],
    };
  }

  const data = message.results;
  if (!validate(data)) {
    log(validate.errors);
    return {
      write: null,
      messages: [{ type: "exit" }],
    };
  }

  const toBeStored = JSON.stringify(data);

  const { num } = message.results;
  if (num >= MAX_PAGE) {
    return {
      write: null,
      messages: [{ type: "exit" }],
    };
  }

  let options = {
    url: templateURI(num + 1),
    method: "GET",
  };

  return {
    // NOTE: Check results in your data directory at ./get-xkcd-extraction
    write: toBeStored,
    messages: [
      {
        type: "https",
        version,
        options: options,
      },
    ],
  };
}
