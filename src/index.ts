import logger from "./logger.js";
import { BnzAdapter } from "./banks/bnz.js";
import { YnabWrapperClient } from "./ynab.js";

export const ADAPTERS: { [name: string]: IBankAdapter } = {};

export interface IBankAdapter {
  // Prepares the adapter for exporting the OFX feed
  login(username: string, password: string): Promise<boolean>;
  // Exports an account's OFX feed for the last 3 days, or returns null;
  exportAccount(accountName: string): Promise<string | null>;
  // Perform optional adapter clean up etc.
  finish?(): Promise<void>;
}

export function registerAdapter(name: string, fn: () => IBankAdapter) {
  ADAPTERS[name] = fn();
}

registerAdapter("bnz", () => new BnzAdapter());

export default async function ynabAPIImporter(opts: {
  ynabAccessToken: string;
  ynabBudgetID: string;
  accounts: { [accountName: string]: string };

  adapter: string;
  username: string;
  password: string;
}) {
  const ynab = new YnabWrapperClient(opts.ynabAccessToken, opts.ynabBudgetID);
  const adapter = ADAPTERS[opts.adapter];
  if (!adapter) {
    throw new Error(`Bank adapter '${opts.adapter} not registered.`);
  }

  logger.info(`Logging into bank '${opts.adapter}'`);
  const loggedIn = await adapter.login(opts.username, opts.password);
  if (!loggedIn) {
    throw new Error(`Could not login to bank '${opts.adapter}.`);
  }

  await Promise.all(
    Object.keys(opts.accounts).map(async accountName => {
      logger.info(`Exporting ${accountName}`);
      const ynabAccountID = opts.accounts[accountName] as string;
      const ofx = await adapter.exportAccount(accountName);
      if (!ofx) {
        return;
      }

      logger.info(`Importing ${accountName}`);
      await ynab.importOFX(ynabAccountID, ofx);
    })
  );

  if (adapter.finish) {
    await adapter.finish();
  }
}
