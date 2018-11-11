"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
// tslint:disable max-classes-per-file
class BnzClient {
    constructor(opts) {
        this.browser = opts.browser;
        this.accessNumber = opts.accessNumber;
        this.password = opts.password;
    }
    async login() {
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
exports.BnzClient = BnzClient;
class BnzPage {
    constructor(client, page) {
        this.client = client;
        this.page = page;
    }
}
class BnzDashboardPage extends BnzPage {
    async getAccountButton(accountName) {
        const accounts = await this.page.$x(`//h3[@title='${accountName}']/ancestor::div[contains(@class, ' js-account ')]`);
        return accounts[0];
    }
    async getAccountID(accountName) {
        const account = await this.getAccountButton(accountName);
        if (account) {
            const id = await this.page.evaluate((el) => el.dataset.dragId, account);
            return id;
        }
        return null;
    }
    async exportAccount(accountName, fromDate = moment_timezone_1.default()
        .tz('Pacific/Auckland')
        .subtract(4, "days")
        .format("YYYY-MM-DD"), toDate = moment_timezone_1.default()
        .tz('Pacific/Auckland')
        .subtract(1, "day")
        .format("YYYY-MM-DD")) {
        const accountID = await this.getAccountID(accountName);
        const exportURL = `https://www.bnz.co.nz/ib/api/accounts/${accountID}/` +
            `transactions/export/legacy?` +
            `fromDate=${fromDate}&` +
            `toDate=${toDate}&` +
            `format=O`;
        const resp = (await this.page.evaluate(async (url) => {
            const res = await fetch(url, {
                credentials: "same-origin"
            });
            const body = await res.text();
            return body;
        }, exportURL));
        return Buffer.from(JSON.parse(resp), "base64").toString();
    }
}
//# sourceMappingURL=bnz.js.map