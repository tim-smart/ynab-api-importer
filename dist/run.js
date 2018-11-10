"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
const config = require("../config");
_1.default({
    accounts: config.accounts,
    bnzAccessNumber: config.bnzAccessNumber,
    bnzPassword: config.bnzPassword,
    ynabAccessToken: config.ynabAccessToken,
    ynabBudgetID: config.ynabBudgetID
}).catch(err => {
    // tslint:disable no-console
    console.error(err);
    process.exit();
});
//# sourceMappingURL=run.js.map