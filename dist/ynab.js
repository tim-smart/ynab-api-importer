"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ofx_js_1 = require("ofx-js");
const moment = require("moment-timezone");
async function ofxToSaveTransactions(input, ynabAccountID) {
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
    if (!Array.isArray(transactionList)) {
        transactionList = [transactionList];
    }
    return transactionList.map((trans) => {
        const amount = +(trans.TRNAMT.replace(".", "") + "0");
        const date = moment(trans.DTPOSTED, "YYYYMMDD").format("YYYY-MM-DD");
        return {
            account_id: ynabAccountID,
            amount,
            date,
            import_id: getImportID(date, amount),
            memo: trans.MEMO,
            payee_name: trans.NAME
        };
    });
}
exports.ofxToSaveTransactions = ofxToSaveTransactions;
//# sourceMappingURL=ynab.js.map