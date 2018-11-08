import logger from "./logger.js";
import puppeteer from "puppeteer";
import { exportAccount, login } from "./bnz";
import { YnabWrapperClient } from "./ynab.js";
const config: any = require("../config");

async function main() {
  // tslint:disable no-console
  const ynab = new YnabWrapperClient(
    config.ynabAccessToken,
    config.ynabBudgetID
  );
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  logger.info("Logging into BNZ");
  await login(page, config.bnzAccessNumber, config.bnzPassword);

  await Promise.all(
    Object.keys(config.accounts)
      .filter(name => !!name)
      .map(async accountName => {
        logger.info(`Exporting ${accountName}`);
        const ynabAccountID = config.accounts[accountName] as string;
        const ofx = await exportAccount(page, accountName);
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
