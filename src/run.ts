import bnzYnabImport from ".";

const config: any = require("../config");

bnzYnabImport({
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
