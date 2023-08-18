import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    TupleItemInt
} from 'ton-core';

export type Task3Config = {};

export function task3ConfigToCell(config: Task3Config): Cell {
    return beginCell().endCell();
}

export class Task3 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task3(address);
    }

    static createFromConfig(config: Task3Config, code: Cell, workchain = 0) {
        const data = task3ConfigToCell(config);
        const init = { code, data };
        return new Task3(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getReplace(provider: ContractProvider, flag: number, value: number, list: Cell) {
        const res = await provider.get('find_and_replace', [
            {type: 'int', value: BigInt(flag)},
            {type: 'int', value: BigInt(value)},
            {type: 'cell', cell: list}
        ]);
        let cell: Cell | null = res.stack.readCell();
        const result = [];
        while (cell) {
            result.push(cell);
            const s = cell.beginParse();
            if (s.remainingRefs) {
                cell = s.loadRef();
            } else {
                cell = null;
            }
        }

        return result;
    }
}
