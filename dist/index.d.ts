import { SaveTransaction } from "ynab";
export { ofxToSaveTransactions } from "./ynab";
export declare const ADAPTERS: {
    [name: string]: IBankAdapter;
};
export interface IBankAdapter {
    prepare(options: any): Promise<boolean>;
    exportAccount(accountName: string, ynabAccountID: string): Promise<SaveTransaction[]>;
    finish?(): Promise<void>;
}
export default function ynabAPIImporter(opts: {
    registerAdapters?: {
        [name: string]: string;
    };
    ynabAccessToken: string;
    ynabBudgetID: string;
    accounts: {
        [accountName: string]: string;
    };
    adapter: string;
    adapterOptions: any;
}): Promise<void>;
