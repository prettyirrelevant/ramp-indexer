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
