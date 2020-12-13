import ynabAPIImporter from ".";

const config: any = require("../config");

ynabAPIImporter(config).catch(err => {
  // tslint:disable no-console
  console.error(err.stack);
  process.exit();
});
