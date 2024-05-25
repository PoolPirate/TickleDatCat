import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  RawTransaction,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { ACCOUNT, SEND_BACKOFF, initConfig } from "./config";

const aptosConfig = new AptosConfig({
  network: Network.MAINNET,
  //fullnode:
  //  "https://methodical-bold-panorama.aptos-mainnet.quiknode.pro/bc71b86728afcff20dc54fcde420302bf2a1db96/v1",
});
const aptos = new Aptos(aptosConfig);
let progress: number = 0;

let shouldWait = false;

let nonce: bigint = 0n;

async function refreshNonce() {
  console.log("Refreshing Sequence Number");
  const accountInfo = await aptos.account.getAccountInfo({
    accountAddress: ACCOUNT.accountAddress,
  });
  nonce = BigInt(accountInfo.sequence_number);
}

async function meowTheseNuts() {
  const generatedTx = await aptos.transaction.build.simple({
    sender: ACCOUNT.accountAddress,
    data: {
      function:
        "0x7de3fea83cd5ca0e1def27c3f3803af619882db51f34abf30dd04ad12ee6af31::tapos::play",
      functionArguments: [],
    },
  });

  while (true) {
    try {
      const rawTx = new RawTransaction(
        ACCOUNT.accountAddress,
        nonce++,
        generatedTx.rawTransaction.payload,
        10n,
        100n,
        BigInt(new Date().getTime()) + 30n,
        generatedTx.rawTransaction.chain_id
      );
      const tx = new SimpleTransaction(rawTx);

      aptos.transaction
        .signAndSubmitTransaction({
          signer: ACCOUNT,
          transaction: tx,
        })
        .then(() => console.log(`MEOW ${progress++}`));

      if (shouldWait) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await refreshNonce();
        shouldWait = false;
      }

      await new Promise((resolve) => setTimeout(resolve, SEND_BACKOFF));
    } catch (error) {
      console.log("Err", error);
    }
  }
}

process.on("unhandledRejection", async (reason, promise) => {
  console.log("Unhandled Promise", reason);
  shouldWait = true;
});

function main() {
  initConfig();
  refreshNonce()
    .then(meowTheseNuts)
    .catch((err) => console.log("App crashed", err));
}

main();
