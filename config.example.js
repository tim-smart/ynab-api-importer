module.exports = {
  ynabAccessToken: process.env.YNAB_ACCESS_TOKEN || "",
  ynabBudgetID: process.env.YNAB_BUDGET_ID || "ynab-budget-id-here",

  bnzAccessNumber: process.env.BNZ_ACCESS_NUMBER || "",
  bnzPassword: process.env.BNZ_PASSWORD || "",

  accounts: {
    Checking: "ynab-account-id-here"
  }
};
