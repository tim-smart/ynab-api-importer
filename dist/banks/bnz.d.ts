import { Browser, Page } from "puppeteer";
import { IBankAdapter } from "../index";
export declare class BnzAdapter implements IBankAdapter {
    browser?: Browser;
    page?: Page;
    login(username: string, password: string): Promise<boolean>;
    exportAccount(accountName: string): Promise<string | null>;
    finish(): Promise<void>;
    private setupBrowser;
    private getAccountButton;
    private getAccountID;
}
