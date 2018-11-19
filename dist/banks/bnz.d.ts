import { Browser, Page } from "puppeteer";
import { IBankAdapter } from "../index";
import { SaveTransaction } from "ynab";
export declare class BnzAdapter implements IBankAdapter {
    browser?: Browser;
    page?: Page;
    prepare(opts: {
        accessNumber: string;
        password: string;
    }): Promise<boolean>;
    exportAccount(accountName: string, ynabAccountID: string): Promise<SaveTransaction[]>;
    finish(): Promise<void>;
    private setupBrowser;
    private getAccountButton;
    private getAccountID;
}
