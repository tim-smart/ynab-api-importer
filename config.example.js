module.exports = {
  // Register custom adapters here.
  // { nameOfAdapter: 'npm-module-name-here' }
  registerAdapters: {},

  ynabAccessToken: process.env.YNAB_ACCESS_TOKEN || "",
  ynabBudgetID: process.env.YNAB_BUDGET_ID || "ynab-budget-id-here",

  banks: {
    personal: {
      adapter: "bnz",
      options: {
        accessNumber: process.env.BNZ_ACCESS_NUMBER || "",
        password: process.env.BNZ_PASSWORD || "",
      },
    },
  },

  accounts: [
    {
      bank: "personal",
      id: "Checking",
      ynabID: "ynab-account-id-here",
    },
  ],
};
