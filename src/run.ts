import logger from "./logger.js";
import puppeteer from "puppeteer";
import { BnzClient } from "./bnz.js";
import { YnabWrapperClient } from "./ynab.js";
const config: any = require("../config");

async function main() {
  // tslint:disable no-console
  const ynab = new YnabWrapperClient(
    config.ynabAccessToken,
    config.ynabBudgetID
  );
  const browser = await puppeteer.launch();
  const bnz = new BnzClient({
    accessNumber: config.bnzAccessNumber,
    browser,
    password: config.bnzPassword
  });

  logger.info("Logging into BNZ");
  const bnzDashboard = await bnz.login();

  await Promise.all(
    Object.keys(config.accounts)
      .filter(name => !!name)
      .map(async accountName => {
        logger.info(`Exporting ${accountName}`);
        const ynabAccountID = config.accounts[accountName] as string;
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

main().catch(err => {
  // tslint:disable no-console
  console.error(err);
  process.exit();
});
