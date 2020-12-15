import * as F from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as Rx from "rxjs";
import * as RxOp from "rxjs/operators";
import { API, SaveTransaction } from "ynab";
import * as Adapters from "./adapters";
import logger from "./logger";

export interface IAccount {
  /** Which bank settings to use */
  bank: string;
  /** Account ID for your bank account */
  id: string;
  /** YNAB account ID */
  ynabID: string;
}

export const sync = (ynab: API) => (ynabBudgetID: string) => (
  banks: Map<string, Adapters.TBankAdapterFunctions>,
) => (accounts: IAccount[]) =>
  Rx.from(accounts).pipe(
    RxOp.flatMap(account =>
      F.pipe(
        O.fromNullable(banks.get(account.bank)),
        O.fold(
          () => {
            logger.info("Could not find bank:", account.bank);
            return Rx.EMPTY;
          },
          ([fetch, _cleanup]) => Rx.of({ account, fetch }),
        ),
      ),
    ),

    RxOp.tap(({ account: { id, bank } }) =>
      logger.info(`Exporting ${bank} - ${id}`),
    ),

    RxOp.flatMap(({ account: { bank, id, ynabID }, fetch }) =>
      fetch(id, ynabID).then(r => {
        logger.info(`Exported ${bank} - ${id} (${r.length})`);
        return r;
      }),
    ),

    RxOp.reduce((acc, t) => acc.concat(t), [] as SaveTransaction[]),
    RxOp.filter(t => !!t.length),

    RxOp.flatMap(transactions =>
      ynab.transactions.createTransactions(ynabBudgetID, {
        transactions,
      }),
    ),

    RxOp.tap(() => logger.info("Transactions imported")),
  );
