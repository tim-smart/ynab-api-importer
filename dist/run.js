"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_js_1 = __importDefault(require("./logger.js"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const bnz_js_1 = require("./bnz.js");
const ynab_js_1 = require("./ynab.js");
const config = require("../config");
async function main() {
    // tslint:disable no-console
    const ynab = new ynab_js_1.YnabWrapperClient(config.ynabAccessToken, config.ynabBudgetID);
    const browser = await puppeteer_1.default.launch();
    const bnz = new bnz_js_1.BnzClient({
        accessNumber: config.bnzAccessNumber,
        browser,
        password: config.bnzPassword
    });
    logger_js_1.default.info("Logging into BNZ");
    const bnzDashboard = await bnz.login();
    await Promise.all(Object.keys(config.accounts)
        .filter(name => !!name)
        .map(async (accountName) => {
        logger_js_1.default.info(`Exporting ${accountName}`);
        const ynabAccountID = config.accounts[accountName];
        const ofx = await bnzDashboard.exportAccount(accountName);
        if (!ofx) {
            return;
        }
        logger_js_1.default.info(`Importing ${accountName}`);
        await ynab.importOFX(ynabAccountID, ofx);
    }));
    await browser.close();
}
main().catch(err => {
    // tslint:disable no-console
    console.error(err);
    process.exit();
});
//# sourceMappingURL=run.js.map