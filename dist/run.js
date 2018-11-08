"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("../config.json"));
const logger_js_1 = __importDefault(require("./logger.js"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const bnz_1 = require("./bnz");
const ynab_js_1 = require("./ynab.js");
async function main() {
    // tslint:disable no-console
    const ynab = new ynab_js_1.YnabWrapperClient(config_json_1.default.ynabAccessToken, config_json_1.default.ynabBudgetID);
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    logger_js_1.default.info("Logging into BNZ");
    await bnz_1.login(page, config_json_1.default.bnzAccessNumber, config_json_1.default.bnzPassword);
    await Promise.all(Object.keys(config_json_1.default.accounts)
        .filter(name => !!name)
        .map(async (accountName) => {
        logger_js_1.default.info(`Exporting ${accountName}`);
        const ynabAccountID = config_json_1.default.accounts[accountName];
        const ofx = await bnz_1.exportAccount(page, accountName);
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