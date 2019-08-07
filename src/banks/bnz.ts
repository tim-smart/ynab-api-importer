import moment from "moment-timezone";
import puppeteer, { Browser, Page } from "puppeteer";
import { IBankAdapter } from "../index";
import { ofxToSaveTransactions } from "../ynab";
import { SaveTransaction } from "ynab";

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

export class BnzAdapter implements IBankAdapter {
  public browser?: Browser;
  public page?: Page;

  private accountListCache?: IBnzAccountList;

  public async prepare(opts: { accessNumber: string; password: string }) {
    await this.setupBrowser();
    this.page = await this.browser!.newPage();

    await this.page.goto("https://secure.bnz.co.nz/auth/personal-login");
    await this.page.type("input#field-principal", opts.accessNumber);
    await this.page.type("input#field-credentials", opts.password);
    await this.page.keyboard.press("Enter");

    try {
      await this.page.waitForSelector("span.js-main-menu-button-text");
    } catch (err) {
      return false;
    }

    return true;
  }

  public async exportAccount(
    accountName: string,
    ynabAccountID: string
  ): Promise<SaveTransaction[]> {
    const accountID = await this.getAccountID(accountName);
    const fromDate = moment()
      .tz("Pacific/Auckland")
      .subtract(8, "days")
      .format("YYYY-MM-DD");
    const toDate = moment()
      .tz("Pacific/Auckland")
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    const exportURL =
      `https://www.bnz.co.nz/ib/api/accounts/${accountID}/` +
      `transactions/export/legacy?` +
      `fromDate=${fromDate}&` +
      `toDate=${toDate}&` +
      `format=O`;

    const resp = (await this.page!.evaluate(async url => {
      const res = await fetch(url, {
        credentials: "same-origin"
      });

      const body = await res.text();
      return body;
    }, exportURL)) as string;

    const ofx = Buffer.from(JSON.parse(resp), "base64").toString();
    const transactions = await ofxToSaveTransactions(ofx, ynabAccountID);
    return transactions;
  }

  public async finish() {
    await this.browser!.close();
  }

  private async setupBrowser() {
    if (this.browser) {
      await this.browser.close();
    }

    this.browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true
    });
  }

  private async getAccounts() {
    if (this.accountListCache) {
      return this.accountListCache;
    }

    this.accountListCache = (await this.page!.evaluate(async () => {
      const res = await fetch("https://www.bnz.co.nz/ib/api/accounts");
      const json = await res.json();
      return json;
    })) as IBnzAccountList;

    return this.accountListCache;
  }

  private async getAccountID(accountName: string) {
    const accounts = await this.getAccounts();

    for (const account of accounts.accountList) {
      if (account.nickname === accountName) {
        return account.id;
      }
    }

    return null;
  }
}
