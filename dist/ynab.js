"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const ynab_1 = require("ynab");
const ofx_js_1 = require("ofx-js");
const moment = require("moment");
const logger = logger_1.default.child({ module: "ynab" });
class YnabWrapperClient {
    static async ofxToTransactions(accountID, input) {
        const res = await ofx_js_1.parse(input);
        const counters = {};
        function getImportID(date, amount) {
            const prefix = `YNAB:${amount}:${date}`;
            if (!counters[prefix]) {
                counters[prefix] = 1;
            }
            else {
                counters[prefix]++;
            }
            return `${prefix}:${counters[prefix]}`;
        }
        let transactionList;
        if (res.OFX.BANKMSGSRSV1) {
            transactionList =
                res.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
        }
        else if (res.OFX.CREDITCARDMSGSRSV1) {
            transactionList =
                res.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN;
        }
        else {
            return [];
        }
        return transactionList.map((trans) => {
            const amount = +(trans.TRNAMT.replace(".", "") + "0");
            const date = moment(trans.DTPOSTED, "YYYYMMDD").format("YYYY-MM-DD");
            return {
                account_id: accountID,
                amount,
                date,
                import_id: getImportID(date, amount),
                memo: trans.MEMO,
                payee_name: trans.NAME
            };
        });
    }
    constructor(accessToken, budgetID) {
        this.budgetID = budgetID;
        this.client = new ynab_1.API(accessToken);
    }
    async importOFX(accountID, input) {
        const transactions = await YnabWrapperClient.ofxToTransactions(accountID, input);
        logger.debug(`Importing ${transactions.length} transactions`);
        if (!transactions.length) {
            return;
        }
        const res = await this.client.transactions.createTransactions(this.budgetID, {
            transactions
        });
        return res;
    }
}
exports.YnabWrapperClient = YnabWrapperClient;
//# sourceMappingURL=ynab.js.map