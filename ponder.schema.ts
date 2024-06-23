import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Token: p.createTable(
    {
      id: p.string(),
      chainId: p.int(),
      name: p.string(),
      symbol: p.string(),
      logoUrl: p.string(),
      creator: p.string(),
      timestamp: p.bigint(),
      isMigrated: p.boolean(),
      description: p.string(),
      trades: p.many("Trade.tokenId"),
      prices: p.many("Price.tokenId"),
      marketCap: p.bigint().optional(),
      lpAddress: p.string().optional(),
      twitterLink: p.string().optional(),
      websiteLink: p.string().optional(),
      telegramLink: p.string().optional(),
    },
    { creatorIndex: p.index("creator") },
  ),
  TradeType: p.createEnum(["BUY", "SELL"]),
  Trade: p.createTable({
    id: p.string(),
    fee: p.bigint(),
    actor: p.string(),
    amountIn: p.bigint(),
    timestamp: p.bigint(),
    amountOut: p.bigint(),
    token: p.one("tokenId"),
    action: p.enum("TradeType"),
    tokenId: p.string().references("Token.id"),
  }),
  Price: p.createTable({
    id: p.int(), // Unix timestamp of the start of the hour.
    low: p.bigint(),
    count: p.int(),
    open: p.bigint(),
    high: p.bigint(),
    close: p.bigint(),
    average: p.float(),
    token: p.one("tokenId"),
    tokenId: p.string().references("Token.id"),
  }),
}));
