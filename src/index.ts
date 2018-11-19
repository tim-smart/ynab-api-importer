import logger from "./logger.js";
import { API, SaveTransaction } from "ynab";
import { BnzAdapter } from "./banks/bnz";

// Export useful OFX conversion function
export { ofxToSaveTransactions } from "./ynab";

export const ADAPTERS: { [name: string]: IBankAdapter } = {};

export interface IBankAdapter {
  // Prepares the adapter for exporting the OFX feed
  prepare(options: any): Promise<boolean>;
  // Exports an account's OFX feed for the last 3 days, or returns null;
  exportAccount(
    accountName: string,
    ynabAccountID: string
  ): Promise<SaveTransaction[]>;
  // Perform optional adapter clean up etc.
  finish?(): Promise<void>;
}

// Function to register new adapters
function registerAdapter(name: string, fn: () => IBankAdapter) {
  ADAPTERS[name] = fn();
}

// Internal adapters
registerAdapter("bnz", () => new BnzAdapter());

export default async function ynabAPIImporter(opts: {
  registerAdapters?: { [name: string]: string };

  ynabAccessToken: string;
  ynabBudgetID: string;
  accounts: { [accountName: string]: string };

  adapter: string;
  adapterOptions: any;
}) {
  if (opts.registerAdapters) {
    Object.keys(opts.registerAdapters).forEach(name => {
      registerAdapter(name, require(opts.registerAdapters![name]));
    });
  }

  const ynab = new API(opts.ynabAccessToken);
  const adapter = ADAPTERS[opts.adapter];
  if (!adapter) {
    throw new Error(`Bank adapter '${opts.adapter} not registered.`);
  }

  logger.info(`Preparing bank adapter '${opts.adapter}'`);
  const loggedIn = await adapter.prepare(opts.adapterOptions);
  if (!loggedIn) {
    throw new Error(`Could not prepare bank adapter '${opts.adapter}.`);
  }

  await Promise.all(
    Object.keys(opts.accounts).map(async accountName => {
      logger.info(`Exporting ${accountName}`);
      const ynabAccountID = opts.accounts[accountName] as string;
      const transactions = await adapter.exportAccount(
        accountName,
        ynabAccountID
      );
      if (!transactions.length) {
        return;
      }

      logger.info(`Importing ${accountName} (${transactions.length})`);
      await ynab.transactions.createTransactions(opts.ynabBudgetID, {
        transactions
      });
    })
  );

  if (adapter.finish) {
    await adapter.finish();
  }
}
