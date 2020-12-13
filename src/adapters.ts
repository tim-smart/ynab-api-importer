import * as O from "fp-ts/Option";
import { SaveTransaction } from "ynab";
import { bnzAdapter } from "./adapters/bnz";

/**
 * Adapters are higher order functions that take options and return retieval
 * and cleanup functions.
 */
export type TBankAdapter = (opts: any) => Promise<TBankAdapterFunctions>;

export type TBankAdapterFunctions = [
  /** Transaction retieval function */
  (
    adapterAccountID: string,
    ynabAccountID: string,
  ) => Promise<SaveTransaction[]>,
  /** Cleanup function */
  () => Promise<void>,
];

// The adapter registry. Default adapters added here.
const adapters = new Map<string, TBankAdapter>([["bnz", bnzAdapter]]);

export const available = () => Array.from(adapters.keys());

export function register(name: string, adapter: TBankAdapter) {
  adapters.set(name, adapter);
}

export const registerFromObject = (adapters: { [name: string]: string }) =>
  Object.entries(adapters).forEach(([name, module]) =>
    register(name, require(module)),
  );

export const find = (name: string) => O.fromNullable(adapters.get(name));
