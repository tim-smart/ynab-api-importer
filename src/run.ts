import ynabAPIImporter from ".";

const config: any = require("../config");

ynabAPIImporter({
  accounts: config.accounts,
  adapter: config.adapter,
  password: config.password,
  username: config.username,
  ynabAccessToken: config.ynabAccessToken,
  ynabBudgetID: config.ynabBudgetID
}).catch(err => {
  // tslint:disable no-console
  console.error(err);
  process.exit();
});
