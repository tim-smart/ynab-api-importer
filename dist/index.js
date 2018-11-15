"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_js_1 = __importDefault(require("./logger.js"));
const bnz_js_1 = require("./banks/bnz.js");
const ynab_js_1 = require("./ynab.js");
exports.ADAPTERS = {};
function registerAdapter(name, fn) {
    exports.ADAPTERS[name] = fn();
}
exports.registerAdapter = registerAdapter;
registerAdapter("bnz", () => new bnz_js_1.BnzAdapter());
async function ynabAPIImporter(opts) {
    const ynab = new ynab_js_1.YnabWrapperClient(opts.ynabAccessToken, opts.ynabBudgetID);
    const adapter = exports.ADAPTERS[opts.adapter];
    if (!adapter) {
        throw new Error(`Bank adapter '${opts.adapter} not registered.`);
    }
    logger_js_1.default.info(`Logging into bank '${opts.adapter}'`);
    const loggedIn = await adapter.login(opts.username, opts.password);
    if (!loggedIn) {
        throw new Error(`Could not login to bank '${opts.adapter}.`);
    }
    await Promise.all(Object.keys(opts.accounts).map(async (accountName) => {
        logger_js_1.default.info(`Exporting ${accountName}`);
        const ynabAccountID = opts.accounts[accountName];
        const ofx = await adapter.exportAccount(accountName);
        if (!ofx) {
            return;
        }
        logger_js_1.default.info(`Importing ${accountName}`);
        await ynab.importOFX(ynabAccountID, ofx);
    }));
    if (adapter.finish) {
        await adapter.finish();
    }
}
exports.default = ynabAPIImporter;
//# sourceMappingURL=index.js.map