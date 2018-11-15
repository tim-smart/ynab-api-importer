export declare const ADAPTERS: {
    [name: string]: IBankAdapter;
};
export interface IBankAdapter {
    login(username: string, password: string): Promise<boolean>;
    exportAccount(accountName: string): Promise<string | null>;
    finish?(): Promise<void>;
}
export declare function registerAdapter(name: string, fn: () => IBankAdapter): void;
export default function ynabAPIImporter(opts: {
    ynabAccessToken: string;
    ynabBudgetID: string;
    accounts: {
        [accountName: string]: string;
    };
    adapter: string;
    username: string;
    password: string;
}): Promise<void>;
