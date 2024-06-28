import { ponder } from "@/generated";
import { sha256 } from "viem";

ponder.on("RampCurve:TokenLaunch", async ({ event, context }) => {
  const { Token } = context.db;

  await Token.create({
    id: sha256(`${event.args.token}:${context.network.chainId}`),
    data: {
      isMigrated: false,
      name: event.args.name,
      symbol: event.args.symbol,
      logoUrl: event.args.image,
      address: event.args.token,
      creator: event.args.creator,
      websiteLink: event.args.website,
      timestamp: event.block.timestamp,
      chainId: context.network.chainId,
      description: event.args.description,
      twitterLink: event.args.twitterLink,
      telegramLink: event.args.telegramLink,
    },
  });
});

ponder.on("RampCurve:PriceUpdate", async ({ event, context }) => {
  const secondsInHour = 3600n;
  const { Token, Price } = context.db;

  const hourId = Math.floor(
    Number((event.block.timestamp / secondsInHour) * secondsInHour),
  );

  await Price.upsert({
    id: hourId,
    create: {
      count: 1n,
      low: event.args.price,
      high: event.args.price,
      open: event.args.price,
      close: event.args.price,
      average: event.args.price,
      chainId: context.network.chainId,
      tokenId: sha256(`${event.args.token}:${context.network.chainId}`),
    },
    update: ({ current }) => ({
      close: event.args.price,
      low: current.low > event.args.price ? event.args.price : current.low,
      high: current.high < event.args.price ? event.args.price : current.high,
      average:
        (current.average * current.count + event.args.price) / current.count +
        1n,
      count: current.count + 1n,
    }),
  });

  await Token.update({
    data: { marketCap: event.args.mcapEth },
    id: sha256(`${event.args.token}:${context.network.chainId}`),
  });
});

ponder.on("RampCurve:Trade", async ({ event, context }) => {
  const { Trade } = context.db;

  await Trade.create({
    id: sha256(
      `${event.transaction.hash}:${event.log.logIndex}:${context.network.chainId}:${event.block.timestamp}`,
    ),
    data: {
      fee: event.args.fee,
      actor: event.args.trader,
      amountIn: event.args.amountIn,
      amountOut: event.args.amountOut,
      timestamp: event.args.timestamp,
      chainId: context.network.chainId,
      action: event.args.isBuy ? "BUY" : "SELL",
      tokenId: sha256(`${event.args.token}:${context.network.chainId}`),
    },
  });
});

ponder.on("RampCurve:MigrateLiquidity", async ({ event, context }) => {
  const { Token } = context.db;

  await Token.update({
    id: sha256(`${event.args.token}-${context.network.chainId}`),
    data: { lpAddress: event.args.pair, isMigrated: true },
  });
});
