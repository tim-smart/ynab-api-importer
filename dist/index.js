"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_js_1 = __importDefault(require("./logger.js"));
const ynab_1 = require("ynab");
const bnz_1 = require("./banks/bnz");
exports.ADAPTERS = {};
// Function to register new adapters
function registerAdapter(name, fn) {
    exports.ADAPTERS[name] = fn();
}
// Internal adapters
registerAdapter("bnz", () => new bnz_1.BnzAdapter());
async function ynabAPIImporter(opts) {
    if (opts.registerAdapters) {
        Object.keys(opts.registerAdapters).forEach(name => {
            registerAdapter(name, require(opts.registerAdapters[name]));
        });
    }
    const ynab = new ynab_1.API(opts.ynabAccessToken);
    const adapter = exports.ADAPTERS[opts.adapter];
    if (!adapter) {
        throw new Error(`Bank adapter '${opts.adapter} not registered.`);
    }
    logger_js_1.default.info(`Preparing bank adapter '${opts.adapter}'`);
    const loggedIn = await adapter.prepare(opts.adapterOptions);
    if (!loggedIn) {
        throw new Error(`Could not prepare bank adapter '${opts.adapter}.`);
    }
    await Promise.all(Object.keys(opts.accounts).map(async (accountName) => {
        logger_js_1.default.info(`Exporting ${accountName}`);
        const ynabAccountID = opts.accounts[accountName];
        const transactions = await adapter.exportAccount(accountName, ynabAccountID);
        if (!transactions.length) {
            return;
        }
        logger_js_1.default.info(`Importing ${accountName} (${transactions.length})`);
        await ynab.transactions.createTransactions(opts.ynabBudgetID, {
            transactions
        });
    }));
    if (adapter.finish) {
        await adapter.finish();
    }
}
exports.default = ynabAPIImporter;
//# sourceMappingURL=index.js.map