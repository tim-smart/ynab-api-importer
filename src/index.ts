import * as Rx from "rxjs";
import { API } from "ynab";
import * as Accounts from "./accounts";
import * as Adapters from "./adapters";
import * as Banks from "./banks";
import { IBanks } from "./banks";

export * from "./puppeteer";
export * as Ynab from "./ynab";
export * as Banks from "./banks";
export * as Adapters from "./adapters";
export * as Accounts from "./accounts";

export default async function ynabAPIImporter(opts: {
  registerAdapters?: { [name: string]: string };

  ynabAccessToken: string;
  ynabBudgetID: string;

  banks: IBanks;
  accounts: Accounts.IAccount[];
}) {
  // Register custom adapters
  Adapters.registerFromObject(opts.registerAdapters || {});

  // Resolve banks from adapters
  const banks = await Rx.lastValueFrom(
    Banks.resolve(Adapters.find)(opts.banks),
  );
  const ynab = new API(opts.ynabAccessToken);

  await Accounts.sync(ynab)(opts.ynabBudgetID)(banks)(
    opts.accounts,
  ).toPromise();

  await Banks.cleanup(banks).toPromise();
}
