import {Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Tuple} from 'ton-core';

export type Task2Config = {};

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell().endCell();
}

export class Task2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task2(address);
    }

    static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
        const data = task2ConfigToCell(config);
        const init = { code, data };
        return new Task2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getMultiply(provider: ContractProvider, A: number[][], B: number[][]): Promise<number[][]> {
        const res = await provider.get('matrix_multiplier', [
            {type: 'tuple', items: A.map(row => ({
                    type: 'tuple',
                    items: row.map(value => ({ type: 'int', value: BigInt(value) }))
                })
            )},
            {type: 'tuple', items: B.map(row => ({
                        type: 'tuple',
                        items: row.map(value => ({ type: 'int', value: BigInt(value) }))
                    })
                )},
        ]);
        const tuple = res.stack.readTuple();
        const N = tuple.remaining;
        const result = [];
        for (let i = 0; i < N; i++) {
            const colTuple = tuple.readTuple();
            const col = [];
            const M = colTuple.remaining;

            for (let j = 0; j < M; j ++) {
                col.push(colTuple.readNumber());
            }
            result.push(col);
        }

        return result;
    }
}
