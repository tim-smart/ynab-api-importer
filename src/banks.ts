import * as F from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as Rx from "rxjs";
import * as RxOp from "rxjs/operators";
import * as Adapters from "./adapters";

export interface IBank {
  adapter: string;
  options: any;
}

export interface IBanks {
  [name: string]: IBank;
}

export type TBankMap = Map<string, Adapters.TBankAdapterFunctions>;

export const resolve = (
  findAdapter: (name: string) => O.Option<Adapters.TBankAdapter>,
) => (banks: IBanks) =>
  Rx.from(Object.entries(banks)).pipe(
    RxOp.flatMap(([name, { adapter, options }]) =>
      F.pipe(
        findAdapter(adapter),
        O.fold(
          () => Rx.EMPTY,
          a => Rx.zip(Rx.of(name), a(options)),
        ),
      ),
    ),

    RxOp.reduce(
      (banks, [name, fns]) => banks.set(name, fns),
      new Map() as TBankMap,
    ),
  );

export const cleanup = (banks: TBankMap) =>
  Rx.from(banks.values()).pipe(RxOp.flatMap(([_, cleanup]) => cleanup()));
