import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import {beginCell, Cell, toNano} from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task1 = blockchain.openContract(Task1.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        });
    });

    it('Should work with simple cell', async () => {
        const targetCell = beginCell().storeUint(239, 64).endCell();
        const cell = beginCell()
            .storeRef(targetCell)
            .endCell();
        const hash = BigInt('0x' + targetCell.hash().toString('hex'));
        const res = await task1.getFindBranchByHash(hash, cell);


        expect(res.equals(targetCell)).toBeTruthy();
    });

    it('Should work with nested cell', async () => {
        const targetCell = beginCell().storeUint(239, 64).storeRef(beginCell().storeUint(30, 32).endCell()).endCell();
        const cell = beginCell()
            .storeUint(1, 2)
            .storeRef(targetCell)
            .storeRef(beginCell().endCell())
            .storeRef(beginCell().storeRef(beginCell().storeUint(11, 16).endCell()).endCell())
            .endCell();
        const hash = BigInt('0x' + targetCell.hash().toString('hex'));
        const res = await task1.getFindBranchByHash(hash, cell);


        expect(res.equals(targetCell)).toBeTruthy();
    });

});
