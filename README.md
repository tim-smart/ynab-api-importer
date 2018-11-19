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

You need to implent the `IBankAdapter` interface and make it the default export.
Users can then register it using the `registerAdapters` config option (see `config.example.js`).

In your `peerDependencies` include `ynab-api-importer` and `ynab`;

For example:

```typescript
import { IBankAdapter, ofxToSaveTransactions } from "ynab-api-importer";
import { SaveTransaction } from "ynab";

export default class FancyBankAdapter implements IBankAdapter {
  public async prepare(options: any): boolean {
    // Add your implmentation here
    // You can login here, setup puppeteer etc.
    return true;
  }

  public async exportAccount(
    name: string,
    ynabAccountID: string
  ): Promise<SaveTransaction[]> {
    // Add your implmentation here
    // This will be run once for every account
    // It will return an array of YNAB transactions
    const transactions = await ofxToSaveTransactions(
      "ofx-string-here",
      ynabAccountID
    );
    return transactions;
  }

  // Optional cleanup
  public async finish() {
    // Add implmentation
  }
}
```
