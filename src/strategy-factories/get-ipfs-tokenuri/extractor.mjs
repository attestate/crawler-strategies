// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";

export const getIpfsTokenUriFactory = (props) => {
  const { strategyName, version, schema, transformTokenUri } = props;
  const log = logger(strategyName);

  const init = async function (filePath) {
    if (!(await fileExists(filePath))) {
      log(
        `Skipping "${strategyName}" extractor execution as file doesn't exist "${filePath}"`
      );
      return {
        write: "",
        messages: [],
      };
    }

    const rl = createInterface({
      input: createReadStream(filePath),
      crlfDelay: Infinity,
    });

    let messages = [];
    for await (let line of rl) {
      // NOTE: We're ignoring empty lines
      if (line === "") continue;

      const data = JSON.parse(line);
      const { metadata } = data;
      let tokenURI = transformTokenUri
        ? transformTokenUri(data.tokenURI)
        : data.tokenURI;

      messages.push({ ...makeRequest(tokenURI), metadata });
    }
    return {
      write: null,
      messages,
    };
  };

  const makeRequest = function (tokenURI) {
    let headers;
    if (env.IPFS_HTTPS_GATEWAY_KEY) {
      headers = {
        Authorization: `Bearer ${env.IPFS_HTTPS_GATEWAY_KEY}`,
      };
    }
    return {
      type: "ipfs",
      version,
      options: {
        uri: tokenURI,
        gateway: env.IPFS_HTTPS_GATEWAY,
        headers,
      },
      schema,
    };
  };

  const update = function (message) {
    let messages = [];
    return {
      messages,
      write: JSON.stringify({
        metadata: {
          ...message.metadata,
          tokenURI: message.options.uri,
        },
        results: message.results,
      }),
    };
  };

  return { init, update };
};
