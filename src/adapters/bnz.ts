import * as F from "fp-ts/function";
import * as O from "fp-ts/Option";
import { DateTime } from "luxon";
import { Page } from "puppeteer";
import { SaveTransaction } from "ynab";
import { TBankAdapter } from "../adapters";
import { setupPage } from "../puppeteer";
import { ofxToSaveTransactions } from "../ynab";

interface IBnzAccount {
  id: string;
  nickname: string;

  type: string;
  productCode: string;

  bankCode: string;
  branchCode: string;
  accountNumber: string;
  suffix: string;
}

interface IBnzAccountList {
  accountCount: number;
  accountList: IBnzAccount[];
}

const login = (page: Page) => (accessNumber: string, password: string) =>
  page
    .goto("https://secure.bnz.co.nz/auth/personal-login")
    .then(() => page.type("input#field-principal", accessNumber))
    .then(() => page.type("input#field-credentials", password))
    .then(() => page.keyboard.press("Enter"))
    .then(() => page.waitForSelector("span.js-main-menu-button-text"));

const getAccounts = (page: Page) =>
  page.evaluate(async () => {
    const res = await fetch("https://www.bnz.co.nz/ib/api/accounts");
    const json = await res.json();
    return json as IBnzAccountList;
  });

const findAccount = (list: IBnzAccountList) => (accountName: string) =>
  O.fromNullable(list.accountList.find(a => a.nickname === accountName));

const exportAccount = (page: Page) => async (
  accountID: string,
  ynabAccountID: string,
): Promise<SaveTransaction[]> => {
  const nzTime = DateTime.utc().setZone("Pacific/Auckland");
  const fromDate = nzTime.minus({ days: 8 }).toFormat("yyyy-MM-dd");
  const toDate = nzTime.minus({ days: 1 }).toFormat("yyyy-MM-dd");

  const exportURL =
    `https://www.bnz.co.nz/ib/api/accounts/${accountID}/` +
    `transactions/export/legacy?` +
    `fromDate=${fromDate}&` +
    `toDate=${toDate}&` +
    `format=O`;

  const resp = (await page.evaluate(async url => {
    const res = await fetch(url, {
      credentials: "same-origin",
    });

    const body = await res.text();
    return body;
  }, exportURL)) as string;

  const ofx = Buffer.from(JSON.parse(resp), "base64").toString();
  const transactions = await ofxToSaveTransactions(ofx, ynabAccountID);
  return transactions;
};

const transactions = (page: Page) => (accounts: IBnzAccountList) => (
  accountName: string,
  ynabAccountID: string,
): Promise<SaveTransaction[]> =>
  F.pipe(
    findAccount(accounts)(accountName),
    O.fold(
      () => Promise.resolve([]),
      ({ id }) => exportAccount(page)(id, ynabAccountID),
    ),
  );

export const bnzAdapter: TBankAdapter = ({
  accessNumber,
  password,
}: {
  accessNumber: string;
  password: string;
}) =>
  setupPage().then(({ browser, page }) =>
    login(page)(accessNumber, password)
      .then(() => getAccounts(page))
      .then(accounts => [transactions(page)(accounts), () => browser.close()]),
  );
