import { ITransaction, parse, TTransactionList } from "ofx-js";
import { SaveTransaction } from "ynab";
import moment = require("moment-timezone");

export async function ofxToSaveTransactions(
  input: string,
  ynabAccountID: string
): Promise<SaveTransaction[]> {
  const res = await parse(input);
  const counters: { [index: string]: number } = {};

  function getImportID(date: string, amount: number) {
    const prefix = `YNAB:${amount}:${date}`;

    if (!counters[prefix]) {
      counters[prefix] = 1;
    } else {
      counters[prefix]++;
    }

    return `${prefix}:${counters[prefix]}`;
  }

  let transactionList: TTransactionList | ITransaction;
  if (res.OFX.BANKMSGSRSV1) {
    transactionList =
      res.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
  } else if (res.OFX.CREDITCARDMSGSRSV1) {
    transactionList =
      res.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN;
  } else {
    return [];
  }

  if (!Array.isArray(transactionList)) {
    transactionList = [transactionList];
  }

  return transactionList.map(
    (trans): SaveTransaction => {
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
    }
  );
}
