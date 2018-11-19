module.exports = {
  // Register custom adapters here.
  // { nameOfAdapter: 'npm-module-name-here' }
  registerAdapters: {},

  ynabAccessToken: process.env.YNAB_ACCESS_TOKEN || "",
  ynabBudgetID: process.env.YNAB_BUDGET_ID || "ynab-budget-id-here",

  adapter: "bnz",
  adapterOptions: {
    accessNumber: process.env.BNZ_ACCESS_NUMBER || "",
    password: process.env.BNZ_PASSWORD || ""
  },

  accounts: {
    Checking: "ynab-account-id-here"
  }
};
