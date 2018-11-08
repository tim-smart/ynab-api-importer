declare module "ofx-js" {
  interface IOFXResult {
    header: Map<string, any>;
    OFX: {
      BANKMSGSRSV1?: {
        STMTTRNRS: IStatementWrapper;
      };
      CREDITCARDMSGSRSV1?: {
        CCSTMTTRNRS: ICCStatementWrapper;
      };
      SIGNONMSGSRSV1: Map<string, any>;
    };
  }

  interface IStatementWrapper {
    STATUS: IStatementWrapperStatus;
    STMTRS: IStatement;
    TRNUID: string;
  }

  interface ICCStatementWrapper {
    STATUS: IStatementWrapperStatus;
    CCSTMTRS: ICCStatement;
    TRNUID: string;
  }

  interface IStatementWrapperStatus {
    CODE: string;
    SEVERITY: string;
    MESSAGE: string;
  }

  interface IStatement {
    AVAILBAL: IAvailableBalance;
    BANKACCTFROM: IBankAccountInfo;
    BANKTRANLIST: ITransactionListWrapper;
    CURDEF: string;
    LEDGERBAL: ILedgerBalance;
  }

  interface ICCStatement {
    AVAILBAL: IAvailableBalance;
    CCACCTFROM: IBankAccountInfo;
    BANKTRANLIST: ITransactionListWrapper;
    CURDEF: string;
    LEDGERBAL: ILedgerBalance;
  }

  interface IAvailableBalance {
    BALAMT: string;
    DTASOF: string;
  }

  interface IBankAccountInfo {
    ACCTID: string;
    ACCTTYPE?: string;
    BANKID?: string;
  }

  interface ITransactionListWrapper {
    DTEND: string;
    DTSTART: string;
    STMTTRN: TTransactionList;
  }

  export type TTransactionList = Array<ITransaction>;

  export interface ITransaction {
    DTPOSTED: string;
    FITID: string;
    MEMO: string;
    NAME: string;
    TRNAMT: string;
    TRNTYPE: string;
  }

  interface ILedgerBalance {
    BALAMT: string;
    DTASOF: string;
  }

  export function parse(ofx: string): Promise<IOFXResult>;
}
