# ynab-api-importer

A lot of international banks are unsupported by YNAB's direct feed feature. So
here is yet another YNAB API importer.

To make this useful you will need some technical knowledge. It is recommended
that you run this as a cron job everyday to make sure YNAB is always up-to-date.

Current the following adapters are implemented:

- BNZ (Bank of New Zealand)

## Configuration

Copy `config.example.js` to `config.js` and change to your liking.

Then run `npm install --production` and `npm start`.

## For developers

If you would like to create your own adapter, take a look at `src/banks/bnz.ts`.

You need to implement a `TBankAdapter` function and make it the default export
of your NPM module.
Users can then register it using the `registerAdapters` config option (see
`config.example.js`).

In your `peerDependencies` include `ynab-api-importer` and `ynab`;

For example:

```typescript
import { Page } from "puppeteer";
import {
  TBankAdapter,
  ofxToSaveTransactions,
  setupPage,
} from "ynab-api-importer";
import { SaveTransaction } from "ynab";

const export = (page: Page) => async (
  accountID: string,
  ynabAccountID: string,
): Promise<SaveTransaction[]> => {
  // Add your implmentation here
  // This will be run once for every account
  // It needs to return an array of YNAB transactions

  const ofxString = await doSomethingWith(page);
  const transactions = await ofxToSaveTransactions(
    ofxString,
    ynabAccountID,
  );
  return transactions;
}

const fancyBankAdapter: TBankAdapter = async () =>{
  // You can login here, setup puppeteer etc.
  const { browser, page } = await setupPage();

  // Return two functions. First one exports the transactions. Second one does
  // cleanup.
  return [export(page), () => browser.close()];
}

export default fancyBankAdapter;
```
