import * as F from "fp-ts/function";
import * as O from "fp-ts/Option";
import { DateTime } from "luxon";
import { Page } from "puppeteer";
import { SaveTransaction } from "ynab";
import { Adapters, Ynab, setupPage } from "../../";
import { IBnzAccountList, Transaction, TransactionsResponse } from "./types";

const login = (page: Page) => async (
  accessNumber: string,
  password: string,
) => {
  await page.goto("https://secure.bnz.co.nz/auth/personal-login");
  await page.type("input#field-principal", accessNumber);
  await page.type("input#field-credentials", password);
  await page.keyboard.press("Enter");

  const el = await Promise.race([
    page.waitForSelector("span.js-main-menu-button-text"),
    page.waitForSelector("input[title=Accept]"),
  ]);

  await el.click();
  await page.waitForSelector("span.js-main-menu-button-text");
};

const request = (page: Page) => <T>(
  path: string,
  opts: Partial<RequestInit> = {},
) =>
  page.evaluate(
    (path, opts) =>
      fetch(`https://www.bnz.co.nz/ib/api${path}`, {
        credentials: "same-origin",
        ...opts,
      }).then(r => r.json() as Promise<T>),
    path,
    opts as any,
  );

const getAccounts = (page: Page) => request(page)<IBnzAccountList>("/accounts");

const findAccount = (list: IBnzAccountList) => (accountName: string) =>
  O.fromNullable(list.accountList.find(a => a.nickname === accountName));

const listTransactions = (page: Page) => (accountID: string) => {
  const nzTime = DateTime.utc().setZone("Pacific/Auckland");
  const fromDate = nzTime.minus({ days: 8 }).toISODate();
  const toDate = nzTime.plus({ days: 1 }).toISODate();

  return request(page)<TransactionsResponse>(
    `/transactions?from=${fromDate}&to=${toDate}&account=${accountID}`,
  );
};

const isPending = (t: Transaction) => t.status.code !== "POSTED";
const isInternational = (t: Transaction) => t.value.currency !== "NZD";
const isPendingInternational = (t: Transaction) =>
  isPending(t) && isInternational(t);
const filterPendingInternational = (t: Transaction[]) =>
  t.filter(t => !isPendingInternational(t));
const filterPending = (t: Transaction[]) => t.filter(t => !isPending(t));

const dateTime = (timestamp: string) =>
  DateTime.fromISO(timestamp, { zone: "Pacific/Auckland" });
const isFuture = (t: Transaction) => dateTime(t.timestamp) > DateTime.local();
const filterFuture = (transactions: Transaction[]) =>
  transactions.filter(t => !isFuture(t));

const memoFromTransaction = ({
  thisAccount: { details },
}: Transaction): string =>
  [details.particulars, details.reference, details.code]
    .filter(s => !!s)
    .join(" ");

const payeeFromTransaction = (t: Transaction): string =>
  F.pipe(
    O.fromNullable(t.otherAccount.holder.name),
    O.alt(() => O.fromNullable(t.thisAccount.details.particulars)),
    O.getOrElse(() => t.type.description),
  );

const convertTransactions = (ynabAccountID: string) => (
  transactions: Transaction[],
): SaveTransaction[] => {
  // Sort oldest -> newest for import ID counters
  transactions = transactions.reverse();
  const importID = Ynab.importID();

  const convert = (t: Transaction): SaveTransaction => {
    const date = dateTime(t.timestamp);
    const amount = Ynab.amountFromString(t.value.amount);
    const import_id = importID(date, amount);
    const memo = memoFromTransaction(t);
    const payee_name = payeeFromTransaction(t);

    return {
      account_id: ynabAccountID,
      amount,
      date: date.toISODate(),
      import_id,
      memo,
      payee_name,
    };
  };

  return transactions.map(convert);
};

const ynabTransactions = (page: Page) => (accounts: IBnzAccountList) => (
  includePending: boolean,
) => (accountName: string, ynabAccountID: string): Promise<SaveTransaction[]> =>
  F.pipe(
    findAccount(accounts)(accountName),
    O.fold(
      () => Promise.resolve([]),
      account =>
        listTransactions(page)(account.id)
          .then(r => r.transactions)
          .then(filterFuture)
          .then(includePending ? filterPendingInternational : filterPending)
          .then(convertTransactions(ynabAccountID)),
    ),
  );

export const bnzAdapter: Adapters.TBankAdapter = async ({
  accessNumber,
  password,
  includePending = false,
}: {
  accessNumber: string;
  password: string;
  includePending?: boolean;
}) => {
  const { browser, page } = await setupPage();

  await login(page)(accessNumber, password);
  const accounts = await getAccounts(page);

  return [
    ynabTransactions(page)(accounts)(includePending),
    () => browser.close(),
  ];
};
