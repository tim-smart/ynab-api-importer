import { SaveTransaction } from "ynab";
export declare function ofxToSaveTransactions(input: string, ynabAccountID: string): Promise<SaveTransaction[]>;
