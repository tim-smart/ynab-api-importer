import moment from "moment-timezone";
import { Browser, Page } from "puppeteer";
// tslint:disable max-classes-per-file

export class BnzClient {
  public browser: Browser;
  public page?: Page;

  public accessNumber: string;
  public password: string;

  constructor(opts: {
    browser: Browser;
    accessNumber: string;
    password: string;
  }) {
    this.browser = opts.browser;
    this.accessNumber = opts.accessNumber;
    this.password = opts.password;
  }

  public async login() {
    if (this.page) {
      await this.page.close();
    }
    this.page = await this.browser.newPage();
    await this.page.goto("https://secure.bnz.co.nz/auth/personal-login");
    await this.page.type('input[name="principal"]', this.accessNumber);
    await this.page.type('input[name="credentials"]', this.password);
    await this.page.keyboard.press("Enter");
    await this.page.waitForSelector("span.js-main-menu-button-text");

    return new BnzDashboardPage(this, this.page);
  }
}

class BnzPage {
  public client: BnzClient;
  public page: Page;

  constructor(client: BnzClient, page: Page) {
    this.client = client;
    this.page = page;
  }
}

class BnzDashboardPage extends BnzPage {
  public async getAccountButton(accountName: string) {
    const accounts = await this.page.$x(
      `//h3[@title='${accountName}']/ancestor::div[contains(@class, ' js-account ')]`
    );
    return accounts[0];
  }

  public async getAccountID(accountName: string) {
    const account = await this.getAccountButton(accountName);
    if (account) {
      const id: string = await this.page.evaluate(
        (el: HTMLDivElement) => el.dataset.dragId,
        account
      );
      return id;
    }

    return null;
  }

  public async exportAccount(
    accountName: string,
    fromDate: string = moment()
      .tz('Pacific/Auckland')
      .subtract(4, "days")
      .format("YYYY-MM-DD"),
    toDate: string = moment()
      .tz('Pacific/Auckland')
      .subtract(1, "day")
      .format("YYYY-MM-DD")
  ): Promise<string | null> {
    const accountID = await this.getAccountID(accountName);
    const exportURL =
      `https://www.bnz.co.nz/ib/api/accounts/${accountID}/` +
      `transactions/export/legacy?` +
      `fromDate=${fromDate}&` +
      `toDate=${toDate}&` +
      `format=O`;

    const resp = (await this.page.evaluate(async url => {
      const res = await fetch(url, {
        credentials: "same-origin"
      });

      const body = await res.text();
      return body;
    }, exportURL)) as string;

    return Buffer.from(JSON.parse(resp), "base64").toString();
  }
}
