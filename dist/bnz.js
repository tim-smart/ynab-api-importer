"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
async function login(page, accessNumber, password) {
    await page.setViewport({
        height: 900,
        width: 1440
    });
    await page.goto("https://secure.bnz.co.nz/auth/personal-login");
    await page.type('input[name="principal"]', accessNumber);
    await page.type('input[name="credentials"]', password);
    await page.keyboard.press("Enter");
    await page.screenshot({ path: "login.png" });
    await page.waitForSelector("span.js-main-menu-button-text");
}
exports.login = login;
async function getAccountButton(page, accountName) {
    const accounts = await page.$x(`//h3[@title='${accountName}']/ancestor::div[contains(@class, ' js-account ')]`);
    return accounts[0];
}
exports.getAccountButton = getAccountButton;
async function getAccountID(page, accountName) {
    const account = await getAccountButton(page, accountName);
    if (account) {
        const id = await page.evaluate((el) => el.dataset.dragId, account);
        return id;
    }
    return null;
}
exports.getAccountID = getAccountID;
async function openAccount(page, accountName) {
    const account = await getAccountButton(page, accountName);
    if (account) {
        await account.click();
        return true;
    }
    return false;
}
exports.openAccount = openAccount;
async function closeAccount(page) {
    await page.click("span.js-close-modal-button");
}
exports.closeAccount = closeAccount;
async function exportAccount(page, accountName, fromDate = moment_1.default()
    .subtract(3, "days")
    .format("YYYY-MM-DD"), toDate = moment_1.default().format("YYYY-MM-DD")) {
    const accountID = await getAccountID(page, accountName);
    const exportURL = `https://www.bnz.co.nz/ib/api/accounts/${accountID}/` +
        `transactions/export/legacy?` +
        `fromDate=${fromDate}&` +
        `toDate=${toDate}&` +
        `format=O`;
    const resp = (await page.evaluate(async (url) => {
        const res = await fetch(url, {
            credentials: "same-origin"
        });
        const body = await res.text();
        return body;
    }, exportURL));
    return Buffer.from(JSON.parse(resp), "base64").toString();
}
exports.exportAccount = exportAccount;
//# sourceMappingURL=bnz.js.map