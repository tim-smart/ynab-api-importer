"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
const config = require("../config");
_1.default({
    registerAdapters: config.registerAdapters,
    accounts: config.accounts,
    adapter: config.adapter,
    adapterOptions: config.adapterOptions,
    ynabAccessToken: config.ynabAccessToken,
    ynabBudgetID: config.ynabBudgetID
}).catch(err => {
    // tslint:disable no-console
    console.error(err);
    process.exit();
});
//# sourceMappingURL=run.js.map