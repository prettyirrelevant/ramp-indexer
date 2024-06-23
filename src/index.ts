import { ponder } from "@/generated";
import { newId } from "./utils";

ponder.on("RampCurve:TokenLaunch", async ({ event, context }) => {
  const { Token } = context.db;

  await Token.create({
    id: event.args.token,
    data: {
      isMigrated: false,
      name: event.args.name,
      symbol: event.args.symbol,
      logoUrl: event.args.image,
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
      count: 1,
      low: event.args.price,
      high: event.args.price,
      open: event.args.price,
      close: event.args.price,
      tokenId: event.args.token,
      average: Number(event.args.price),
    },
    update: ({ current }) => ({
      close: event.args.price,
      low: current.low > event.args.price ? event.args.price : current.low,
      high: current.high < event.args.price ? event.args.price : current.high,
      average:
        (current.average * current.count + Number(event.args.price)) /
          current.count +
        1,
      count: current.count + 1,
    }),
  });

  await Token.update({
    id: event.args.token,
    data: { marketCap: event.args.mcapEth },
  });
});

ponder.on("RampCurve:Trade", async ({ event, context }) => {
  const { Trade, Price, Token } = context.db;

  await Trade.create({
    id: newId("trade"),
    data: {
      fee: event.args.fee,
      actor: event.args.trader,
      tokenId: event.args.token,
      amountIn: event.args.amountIn,
      amountOut: event.args.amountOut,
      timestamp: event.args.timestamp,
      action: event.args.isBuy ? "BUY" : "SELL",
    },
  });
});

ponder.on("RampCurve:MigrateLiquidity", async ({ event, context }) => {
  const { Token } = context.db;

  await Token.update({
    id: event.args.token,
    data: { lpAddress: event.args.pair, isMigrated: true },
  });
});
