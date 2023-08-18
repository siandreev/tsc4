import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import {beginCell, Cell, toNano} from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task3', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task3');
    });

    let blockchain: Blockchain;
    let task3: SandboxContract<Task3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task3 = blockchain.openContract(Task3.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        });
    });

    it('simple replace', async () => {
        const flag = 0b101;
        const value = 0b111;
        const cell = 0b101000;
        const list = beginCell().storeUint(cell, 256).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b111000, 256).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('replace1', async () => {
        const flag = 0b101;
        const value = 0b111;
        const cell = 0b1010101;
        const list = beginCell().storeUint(cell, 256).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b1110111, 256).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('replace2', async () => {
        const flag = 0b101;
        const value = 0b111;
        const cell = 0b101010101;
        const list = beginCell().storeUint(cell, 256).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b111011101, 256).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('no matches', async () => {
        const flag = 0b111;
        const value = 0b101;
        const cell = 0b101010101;
        const list = beginCell().storeUint(cell, 256).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(cell, 256).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('shorter value', async () => {
        const flag = 0b101;
        const value = 0b10;
        const cell = 0b10101010;
        const list = beginCell().storeUint(cell, 256).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b100100, 254).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('two cells', async () => {
        const flag = 0b101;
        const value = 0b111;
        const cell1 = 0b1010101;
        const cell2 = 0b1010101;
        const list = beginCell().storeUint(cell1, 7).storeRef(
            beginCell().storeUint(cell2, 7).endCell()
        ).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b11101111110111, 14).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('two cells dif length', async () => {
        const flag = 0b101;
        const value = 0b11;
        const cell1 = 0b1010101;
        const cell2 = 0b1010101;
        const list = beginCell().storeUint(cell1, 7).storeRef(
            beginCell().storeUint(cell2, 7).endCell()
        ).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b1101111011, 10).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('two cells with border', async () => {
        const flag = 0b101;
        const value = 0b111;
        const cell1 = 0b1010010;
        const cell2 = 0b1010101;
        const list = beginCell().storeUint(cell1, 7).storeRef(
            beginCell().storeUint(cell2, 7).endCell()
        ).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b11100111011101, 14).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('two cells with border 2', async () => {
        const flag = 0b101;
        const value = 0b11;
        const cell1 = 0b1010010;
        const cell2 = 0b1010101;
        const list = beginCell().storeUint(cell1, 7).storeRef(
            beginCell().storeUint(cell2, 7).endCell()
        ).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b11001101101, 11).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('second cell too short', async () => {
        const flag = 0b101;
        const value = 0b111;
        const cell1 = 0b1010010;
        const cell2 = 0b10;
        const list = beginCell().storeUint(cell1, 7).storeRef(
            beginCell().storeUint(cell2, 2).endCell()
        ).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b111001110, 9).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });

    it('second cell empty', async () => {
        const flag = 0b101;
        const value = 0b111;
        const cell1 = 0b1010010;
        const list = beginCell().storeUint(cell1, 7).storeRef(
            beginCell().endCell()
        ).endCell();
        const result = await task3.getReplace(flag, value, list);

        const expected =  beginCell().storeUint(0b1110010, 7).endCell();
        const c = result[0];

        expect(c.equals(expected)).toBeTruthy();
    });
});
