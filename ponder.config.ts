import { createConfig } from "@ponder/core";
import { http, zeroAddress } from "viem";

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
      network: {
        fraxtal: { address: zeroAddress },
        fraxtalTestnet: { address: zeroAddress },
      },
      abi: RampBondingCurveAbi,
    },
  },
});
