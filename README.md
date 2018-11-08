# bnz-ynab-sync

BNZ (Bank of New Zealand) is not supported by YNAB (You Need A Budget) for auto-import.

This tool allows you to sync BNZ transactions into YNAB accounts.

It works by using a headless Chrome browser, so it could break from time to
time.

## Configuration

Copy `config.example.json` to `config.json` and change to your liking.

Then run `npm install --production` and `npm start`.
