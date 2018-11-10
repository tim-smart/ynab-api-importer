import logger from "./logger.js";
import puppeteer from "puppeteer";
import { BnzClient } from "./bnz.js";
import { YnabWrapperClient } from "./ynab.js";

export default async function bnzYnabImport(opts: {
  ynabAccessToken: string;
  ynabBudgetID: string;
  bnzAccessNumber: string;
  bnzPassword: string;
  accounts: { [accountName: string]: string };
}) {
  const ynab = new YnabWrapperClient(opts.ynabAccessToken, opts.ynabBudgetID);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true
  });
  const bnz = new BnzClient({
    accessNumber: opts.bnzAccessNumber,
    browser,
    password: opts.bnzPassword
  });

  logger.info("Logging into BNZ");
  const bnzDashboard = await bnz.login();

  await Promise.all(
    Object.keys(opts.accounts)
      .filter(name => !!name)
      .map(async accountName => {
        logger.info(`Exporting ${accountName}`);
        const ynabAccountID = opts.accounts[accountName] as string;
        const ofx = await bnzDashboard.exportAccount(accountName);
        if (!ofx) {
          return;
        }

        logger.info(`Importing ${accountName}`);
        await ynab.importOFX(ynabAccountID, ofx);
      })
  );

  await browser.close();
}
