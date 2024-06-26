import { ponder } from "@/generated";
import { newId, verifyTokenContract } from "./utils";

ponder.on("RampCurve:TokenLaunch", async ({ event, context }) => {
  const { Token } = context.db;
  try {
    await verifyTokenContract({
      factoryAddress: context.contracts.RampCurve.address,
      supply: 1000000000000000000000000000n,
      chain: context.network.chainId,
      creator: event.args.creator,
      address: event.args.token,
      symbol: event.args.symbol,
      name: event.args.name,
    });
  } catch (e) {
    console.log("Unable to verify token contract due to:");
    console.error(e);
  }

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
      count: 1n,
      low: event.args.price,
      high: event.args.price,
      open: event.args.price,
      close: event.args.price,
      average: event.args.price,
      tokenId: event.args.token,
      chainId: context.network.chainId,
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
    id: event.args.token,
    data: { marketCap: event.args.mcapEth },
  });
});

ponder.on("RampCurve:Trade", async ({ event, context }) => {
  const { Trade } = context.db;

  await Trade.create({
    id: newId("trade"),
    data: {
      fee: event.args.fee,
      actor: event.args.trader,
      tokenId: event.args.token,
      amountIn: event.args.amountIn,
      amountOut: event.args.amountOut,
      timestamp: event.args.timestamp,
      chainId: context.network.chainId,
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
