# ynab-api-importer

A lot of international banks are unsupported by YNAB's direct feed feature. So
here is yet another YNAB API importer.

Current the following adapters are implemented:

- BNZ (Bank of New Zealand)

## Configuration

Copy `config.example.js` to `config.js` and change to your liking.

Then run `npm install --production` and `npm start`.

## For developers

If you would like to create your own adapter, take a look at `src/banks/bnz.ts`.

You need to implent the `IBankAdapter` interface and make it the default export.
Users can then register it using the `registerAdapters` config option (see `config.example.js`).

In your `peerDependencies` include `ynab-api-importer`;

For example:

```typescript
import { IBankAdapter } from "ynab-api-importer";
import { SaveTransaction } from "ynab";

export default class FancyBankAdapter implements IBankAdapter {
  public async login(username: string, password: string): boolean {
    // Add your implmentation here
    return true;
  }

  public async exportAccount(
    name: string,
    ynabAccountID: string
  ): Promise<SaveTransaction[]> {
    // Add your implmentation here
    return [];
  }

  // Optional cleanup
  public async finish() {
    // Add implmentation
  }
}
```
