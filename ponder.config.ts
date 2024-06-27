import { createConfig } from "@ponder/core";
import { http } from "viem";

import { RampBondingCurveAbi } from "./abis/RampBondingCurveAMM";

export default createConfig({
  networks: {
    fraxtalTestnet: {
      chainId: 2522,
      transport: http("https://rpc.testnet.frax.com"),
    },
    fraxtal: {
      chainId: 252,
      transport: http("https://rpc.frax.com"),
    },
  },
  contracts: {
    RampCurve: {
      address: "0xD62BfbF2050e8fEAD90e32558329D43A6efce4C8" as `0x${string}`,
      network: {
        fraxtal: { startBlock: 6271421 },
        fraxtalTestnet: { startBlock: 9666828 },
      },
      abi: RampBondingCurveAbi,
    },
  },
});
