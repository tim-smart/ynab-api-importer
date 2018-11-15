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

You need to implent the `IBankAdapter` interface and register it using
`registerAdapter`.

In your `peerDependencies` include `ynab-api-importer`;

For example:

```typescript
import { IBankAdapter, registerAdapter } from "ynab-api-importer";

registerAdapter("fancy-bank", () => new FancyBankAdapter());

class FancyBankAdapter implements IBankAdapter {
  public async login(username: string, password: string) {
    // Add your implmentation here
    return true;
  }

  public async exportAccount(name: string) {
    // Add your implmentation here
    return "ofx-string-here";
  }

  // Optional cleanup
  public async finish() {
    // Add implmentation
  }
}
```
