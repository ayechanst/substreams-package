// import { createConnectTransport } from "@connectrpc/connect-web";
// import * as fs from "node:fs";
// import fs from "fs";
const fs = require("fs");
import {
  createAuthInterceptor,
  createRegistry,
  createRequest,
  createSubstream,
  isEmptyMessage,
  streamBlocks,
  unpackMapOutput,
} from "@substreams/core";
// import { serializeMessage } from "./serialize";
import { Package } from "@substreams/core/proto";
import { createConnectTransport } from "@connectrpc/connect-web";
//export default async function getData(): Promise<any[]> {

function readPackageFromFile(file: string): Package {
    const fileContents = fs.readFileSync(file);
    return createSubstream(fileContents);
}

export default async function getData() {
  const token =
    "eyJhbGciOiJLTVNFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTc3NzAzOTgsImp0aSI6Ijk2MzE2NjRkLWU0MWItNDBmZC05OWE1LTJkZDFiZDAxNzBlMCIsImlhdCI6MTcyMTc3MDM5OCwiaXNzIjoiZGZ1c2UuaW8iLCJzdWIiOiIwdG9qeTg4MzE1NDQwMzRjNTAzNmQiLCJ2IjoxLCJha2kiOiI3MDFlNWI5ZWZjYjk2MDY3M2FmNTU3YWUwZDdiMWEzZjA0OTVkNTE0ZmExNWQyZTg4YWZkZWYxYjkyM2M4Zjg0IiwidWlkIjoiMHRvank4ODMxNTQ0MDM0YzUwMzZkIn0.tERT2pPhDDEbqG_OAJAme4HJQgl4lSjGTRx-_I7RPDUboX1cAmshNXhTZFcYpsJ0t_eEKLL22PhmL6RLLVK7Mg";
  const module = "map_pools_created";
  const path = "public/substreams.spkg";

  const substreamPackage = readPackageFromFile(path);
  const registry = createRegistry(substreamPackage);

  const transport = createConnectTransport({
    baseUrl: "https://api.streamingfast.io",
    interceptors: [createAuthInterceptor(token)],
    useBinaryFormat: true,
    jsonOptions: {
      typeRegistry: registry,
    },
  });

  const request = createRequest({
    substreamPackage: substreamPackage,
    outputModule: module,
    productionMode: false, // Set to `true` in production.
    stopBlockNum: "+100", // Stream the first 10000 blocks. Will follow chain head if not set.
  });
  try {
    for await (const response of streamBlocks(
      transport,
      request
    )) {
      const output = unpackMapOutput(response, registry);
      if (
        output !== undefined &&
        !isEmptyMessage(output)
      ) {
        const transfersInBlock = output.toJsonString();
        const parsedData = JSON.parse(transfersInBlock)
        return parsedData;
      } 
    }
  } catch (error) {
    console.log(error);
  }
}