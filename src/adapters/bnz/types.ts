export interface IBnzAccount {
  id: string;
  nickname: string;

  type: string;
  productCode: string;

  bankCode: string;
  branchCode: string;
  accountNumber: string;
  suffix: string;
}

export interface IBnzAccountList {
  accountCount: number;
  accountList: IBnzAccount[];
}

// generated from quicktype
export interface TransactionsResponse {
  transactions: Transaction[];
  _links: Links;
}

export interface Links {
  self: First;
  next: First;
  first: First;
  last: First;
}

export interface First {
  href: string;
}

export interface Transaction {
  id: string;
  thisAccount: ThisAccount;
  otherAccount: OtherAccount;
  timestamp: string;
  status: Status;
  value: RunningBalance;
  runningBalance: RunningBalance;
  type: Type;
  channel?: string;
}

export interface OtherAccount {
  accountNumber?: string;
  holder: Holder;
  details: Details;
}

export interface Details {
  particulars?: string;
  code?: string;
  reference?: string;
}

export interface Holder {
  name?: string;
}

export interface RunningBalance {
  currency: string;
  amount: string;
}

export interface Status {
  code: string;
  timestamp?: string;
}

export interface ThisAccount {
  accountHash: string;
  details: Details;
}

export interface Type {
  code: string;
  description: string;
}
