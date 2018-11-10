import { Browser, Page } from "puppeteer";
export declare class BnzClient {
    browser: Browser;
    page?: Page;
    accessNumber: string;
    password: string;
    constructor(opts: {
        browser: Browser;
        accessNumber: string;
        password: string;
    });
    login(): Promise<BnzDashboardPage>;
}
declare class BnzPage {
    client: BnzClient;
    page: Page;
    constructor(client: BnzClient, page: Page);
}
declare class BnzDashboardPage extends BnzPage {
    getAccountButton(accountName: string): Promise<import("puppeteer").ElementHandle<Element>>;
    getAccountID(accountName: string): Promise<string | null>;
    exportAccount(accountName: string, fromDate?: string, toDate?: string): Promise<string | null>;
}
export {};
