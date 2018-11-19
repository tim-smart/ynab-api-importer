"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const ynab_1 = require("../ynab");
class BnzAdapter {
    async prepare(opts) {
        await this.setupBrowser();
        this.page = await this.browser.newPage();
        await this.page.goto("https://secure.bnz.co.nz/auth/personal-login");
        await this.page.type('input[name="principal"]', opts.accessNumber);
        await this.page.type('input[name="credentials"]', opts.password);
        await this.page.keyboard.press("Enter");
        try {
            await this.page.waitForSelector("span.js-main-menu-button-text");
        }
        catch (err) {
            return false;
        }
        return true;
    }
    async exportAccount(accountName, ynabAccountID) {
        const accountID = await this.getAccountID(accountName);
        const fromDate = moment_timezone_1.default()
            .tz("Pacific/Auckland")
            .subtract(8, "days")
            .format("YYYY-MM-DD");
        const toDate = moment_timezone_1.default()
            .tz("Pacific/Auckland")
            .subtract(1, "day")
            .format("YYYY-MM-DD");
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
        const ofx = Buffer.from(JSON.parse(resp), "base64").toString();
        const transactions = await ynab_1.ofxToSaveTransactions(ofx, ynabAccountID);
        return transactions;
    }
    async finish() {
        await this.browser.close();
    }
    async setupBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
        this.browser = await puppeteer_1.default.launch({
            args: ["--no-sandbox"],
            headless: true
        });
    }
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
}
exports.BnzAdapter = BnzAdapter;
//# sourceMappingURL=bnz.js.map