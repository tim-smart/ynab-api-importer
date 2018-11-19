import ynabAPIImporter from ".";

const config: any = require("../config");

ynabAPIImporter({
  registerAdapters: config.registerAdapters,

  accounts: config.accounts,

  adapter: config.adapter,
  adapterOptions: config.adapterOptions,

  ynabAccessToken: config.ynabAccessToken,
  ynabBudgetID: config.ynabBudgetID
}).catch(err => {
  // tslint:disable no-console
  console.error(err.stack);
  process.exit();
});
