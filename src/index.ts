import logger from "./logger";
import { API, SaveTransaction } from "ynab";
import { bnzAdapter } from "./banks/bnz";
import * as Rx from "rxjs";
import * as RxOp from "rxjs/operators";
import * as O from "fp-ts/Option";
import * as F from "fp-ts/function";

export * from "./puppeteer";
export * from "./ynab";

/**
 * Adapters are higher order functions that take options and return retieval
 * and cleanup functions.
 */
export type TBankAdapter = (opts: any) => Promise<TBankAdapterFunctions>;

export type TBankAdapterFunctions = [
  /** Transaction retieval function */
  (
    adapterAccountID: string,
    ynabAccountID: string,
  ) => Promise<SaveTransaction[]>,
  /** Cleanup function */
  () => Promise<void>,
];

const adapters = new Map<string, TBankAdapter>([["bnz", bnzAdapter]]);
export const availableAdapters = () => Array.from(adapters.keys());
export function registerAdapter(name: string, adapter: TBankAdapter) {
  adapters.set(name, adapter);
}
const getAdapter = (name: string) => O.fromNullable(adapters.get(name));

export default async function ynabAPIImporter(opts: {
  registerAdapters?: { [name: string]: string };

  ynabAccessToken: string;
  ynabBudgetID: string;

  banks: { [name: string]: { adapter: string; options: any } };
  accounts: { bank: string; id: string; ynabID: string }[];
}) {
  if (opts.registerAdapters) {
    Object.entries(opts.registerAdapters).forEach(([name, module]) => {
      registerAdapter(name, require(module));
    });
  }

  const banks$ = Rx.from(Object.entries(opts.banks)).pipe(
    RxOp.flatMap(([name, { adapter, options }]) =>
      F.pipe(
        getAdapter(adapter),
        O.fold(
          () => Rx.EMPTY,
          a => Rx.zip(Rx.of(name), a(options)),
        ),
      ),
    ),

    RxOp.reduce(
      (banks, [name, fns]) => banks.set(name, fns),
      new Map<string, TBankAdapterFunctions>(),
    ),
  );
  const banks = await Rx.lastValueFrom(banks$);
  const getBank = (name: string) => O.fromNullable(banks.get(name));

  const ynab = new API(opts.ynabAccessToken);

  await Rx.from(opts.accounts)
    .pipe(
      RxOp.flatMap(account =>
        F.pipe(
          getBank(account.bank),
          O.fold(
            () => {
              logger.info("Could not find bank:", account.bank);
              return Rx.EMPTY;
            },
            ([list]) =>
              Rx.of({
                account,
                list,
              }),
          ),
        ),
      ),

      RxOp.tap(({ account: { id, bank } }) =>
        logger.info(`Exporting ${bank} - ${id}`),
      ),

      RxOp.flatMap(({ account: { bank, id, ynabID }, list }) =>
        Rx.from(list(id, ynabID)).pipe(
          RxOp.tap(transactions =>
            logger.info(`Importing ${bank} - ${id} (${transactions.length})`),
          ),

          RxOp.flatMap(transactions =>
            ynab.transactions.createTransactions(opts.ynabBudgetID, {
              transactions,
            }),
          ),

          RxOp.tap(() => logger.info(`Imported ${bank} - ${id}`)),
        ),
      ),
    )
    .toPromise();

  await Rx.from(banks.values())
    .pipe(RxOp.flatMap(([_, cleanup]) => cleanup()))
    .toPromise();
}
