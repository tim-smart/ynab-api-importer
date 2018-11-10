"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_js_1 = __importDefault(require("./logger.js"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const bnz_js_1 = require("./bnz.js");
const ynab_js_1 = require("./ynab.js");
async function bnzYnabImport(opts) {
    const ynab = new ynab_js_1.YnabWrapperClient(opts.ynabAccessToken, opts.ynabBudgetID);
    const browser = await puppeteer_1.default.launch({
        args: ["--no-sandbox"],
        headless: true
    });
    const bnz = new bnz_js_1.BnzClient({
        accessNumber: opts.bnzAccessNumber,
        browser,
        password: opts.bnzPassword
    });
    logger_js_1.default.info("Logging into BNZ");
    const bnzDashboard = await bnz.login();
    await Promise.all(Object.keys(opts.accounts)
        .filter(name => !!name)
        .map(async (accountName) => {
        logger_js_1.default.info(`Exporting ${accountName}`);
        const ynabAccountID = opts.accounts[accountName];
        const ofx = await bnzDashboard.exportAccount(accountName);
        if (!ofx) {
            return;
        }
        logger_js_1.default.info(`Importing ${accountName}`);
        await ynab.importOFX(ynabAccountID, ofx);
    }));
    await browser.close();
}
exports.default = bnzYnabImport;
//# sourceMappingURL=index.js.map