import {
    Address,
    beginCell,
    Cell,
    comment,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode
} from 'ton-core';

export type Task4Config = {};

export function task4ConfigToCell(config: Task4Config): Cell {
    return beginCell().endCell();
}

export class Task4 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task4(address);
    }

    static createFromConfig(config: Task4Config, code: Cell, workchain = 0) {
        const data = task4ConfigToCell(config);
        const init = { code, data };
        return new Task4(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getEncrypt(provider: ContractProvider, shift: number, text: string) {
        const res = await provider.get('caesar_cipher_encrypt', [
            {type: 'int', value: BigInt(shift)},
            {type: 'cell', cell: comment(text)}
        ]);
        return res.stack.readCell().beginParse().loadStringTail().slice(4);
    }
}
