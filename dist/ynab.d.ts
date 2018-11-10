import { API, SaveTransaction } from "ynab";
export declare class YnabWrapperClient {
    static ofxToTransactions(accountID: string, input: string): Promise<SaveTransaction[]>;
    client: API;
    budgetID: string;
    constructor(accessToken: string, budgetID: string);
    importOFX(accountID: string, input: string): Promise<import("ynab/dist/api").SaveTransactionsResponse | undefined>;
}
