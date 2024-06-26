import { encodeAbiParameters } from "viem";
import { customAlphabet } from "nanoid";
import { URLSearchParams } from "url";
import { readFileSync } from "fs";
import path from "path";

interface FraxscanContractSubmissionResponse {
  status: string;
  result: string;
  message: string;
}

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

export const newId = (prefix: string) => `${prefix}_${nanoid(16)}`;

export const verifyTokenContract = async (opts: {
  factoryAddress: `0x${string}`;
  address: `0x${string}`;
  creator: `0x${string}`;
  chain: 252 | 2522;
  supply: bigint;
  symbol: string;
  name: string;
}) => {
  const { address, factoryAddress, creator, supply, name, chain, symbol } =
    opts;

  const url =
    chain === 2522
      ? "https://api-holesky.fraxscan.com/api"
      : "https://api.fraxscan.com/api";

  const sourceCode = readFileSync(
    path.join(path.dirname(__dirname), "data", "FlattenedRampToken.sol"),
  );

  console.log("source code: ", sourceCode.toString().substring(0, 100));
  console.log(
    "encoded constructor args: ",
    encodeAbiParameters(
      [
        { name: "name", type: "string" },
        { name: "symbol", type: "string" },
        { name: "_curve", type: "address" },
        { name: "_creator", type: "address" },
        { name: "_supply", type: "uint256" },
      ],
      [name, symbol, factoryAddress, creator, supply],
    ),
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      module: "contract",
      optimizationUsed: "1",
      contractaddress: address,
      contractname: "RampToken",
      constructorArguements: encodeAbiParameters(
        [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "_curve", type: "address" },
          { name: "_creator", type: "address" },
          { name: "_supply", type: "uint256" },
        ],
        [name, symbol, factoryAddress, creator, supply],
      ).slice(2), // remove the 0x prefix
      action: "verifysourcecode",
      licenseType: "1", // No license
      sourceCode: sourceCode.toString(),
      codeformat: "solidity-single-file",
      compilerversion: "v0.8.25+commit.b61c2a91",
      apikey: process.env.FRAXSCAN_API_KEY as string,
    }).toString(),
  });

  const data = (await response.json()) as FraxscanContractSubmissionResponse;
  console.log("data: ", data);

  const statusResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      apikey: process.env.FRAXSCAN_API_KEY as string,
      guid: data.result,
      module: "contract",
      action: "checkverifystatus",
    }).toString(),
  });
  const statusData = await statusResponse.json();
  console.log("statusData: ", statusData);
  return statusData;
};
