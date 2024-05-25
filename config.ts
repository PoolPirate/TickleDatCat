import { Account, Ed25519PrivateKey, isNumber } from "@aptos-labs/ts-sdk";
import { existsSync, readFileSync, writeFileSync } from "fs";

export type Config = {
  privateKey: string;
  sendBackoff: number;
};

const plainConfig: Config = {
  privateKey: "",
  sendBackoff: 50,
};

export function initConfig() {
  if (!existsSync("config.json")) {
    writeFileSync("config.json", JSON.stringify(plainConfig, undefined, 2));
  }

  const config = JSON.parse(readFileSync("config.json", "utf8")) as Config;

  try {
    ACCOUNT = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(config.privateKey),
    });
  } catch (error) {
    console.log("Bad privateKey. Check your config");
    process.exit();
  }

  if (!isNumber(config.sendBackoff)) {
    console.log("Bad sendBackoff. Check your config");
    process.exit();
  }

  SEND_BACKOFF = config.sendBackoff;
}

export let ACCOUNT: Account = null!;
export let SEND_BACKOFF: number = 50;
