import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

export const newId = (prefix: string) => `${prefix}_${nanoid(16)}`;
