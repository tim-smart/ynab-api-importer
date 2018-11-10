export default function bnzYnabImport(opts: {
    ynabAccessToken: string;
    ynabBudgetID: string;
    bnzAccessNumber: string;
    bnzPassword: string;
    accounts: {
        [accountName: string]: string;
    };
}): Promise<void>;
