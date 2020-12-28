/// <reference path="./types/ofx-js.d.ts" />

import { ITransaction, parse, TTransactionList } from "ofx-js";
import { SaveTransaction } from "ynab";
import { DateTime } from "luxon";
import * as O from "fp-ts/Option";
import * as F from "fp-ts/function";

const padDecimals = (input: string): string =>
  input.length < 2 ? padDecimals(input + "0") : input;

export const amountFromString = (input: string) => {
  const split = input.split(".");
  const int = split[0];
  const decimals = F.pipe(
    O.fromNullable(split[1]),
    O.map(padDecimals),
    O.getOrElse(() => "00"),
  );

  return +`${int}${decimals}0`;
};

export const importID = () => {
  const counters = new Map<string, number>();

  return (date: DateTime, amount: number) => {
    const prefix = `YNAB:${amount}:${date.toISODate()}`;

    if (counters.has(prefix)) {
      const count = counters.get(prefix)!;
      counters.set(prefix, count + 1);
    } else {
      counters.set(prefix, 1);
    }

    return `${prefix}:${counters.get(prefix)}`;
  };
};

export async function ofxToSaveTransactions(
  input: string,
  ynabAccountID: string,
): Promise<SaveTransaction[]> {
  const res = await parse(input);
  const counters: { [index: string]: number } = {};

  function getImportID(date: string, amount: number) {
    const prefix = `YNAB:${amount}:${date}`;

    if (!counters[prefix]) {
      counters[prefix] = 1;
    } else {
      counters[prefix]++;
    }

    return `${prefix}:${counters[prefix]}`;
  }

  let transactionList: TTransactionList | ITransaction;
  if (res.OFX.BANKMSGSRSV1) {
    transactionList =
      res.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
  } else if (res.OFX.CREDITCARDMSGSRSV1) {
    transactionList =
      res.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN;
  } else {
    return [];
  }

  if (!Array.isArray(transactionList)) {
    transactionList = [transactionList];
  }

  return transactionList.map(
    (trans): SaveTransaction => {
      const amount = +(trans.TRNAMT.replace(".", "") + "0");
      const parsedDate = DateTime.fromFormat(trans.DTPOSTED, "yyyyMMdd");
      const date = parsedDate.toFormat("yyyy-MM-dd");

      return {
        account_id: ynabAccountID,
        amount,
        date,
        import_id: getImportID(date, amount),
        memo: trans.MEMO,
        payee_name: trans.NAME,
      };
    },
  );
}

export const isFuture = (t: SaveTransaction) =>
  DateTime.local().toUTC() < DateTime.fromISO(t.date).startOf("day");
export const filterFuture = (t: SaveTransaction[]) =>
  t.filter(t => !isFuture(t));
