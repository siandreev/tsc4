import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task2', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task2');
    });

    let blockchain: Blockchain;
    let task2: SandboxContract<Task2>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task2 = blockchain.openContract(Task2.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        });
    });

    it('Should multiply', async () => {
        const A = [
            [1, 2],
            [2, 1],
            [3, 4]
        ];
        const B = [
            [1, 2, 3],
            [3, 2, 1],
            [3, 2, 1],
            [3, 2, 3],
        ];
        const res = await task2.getMultiply(A, B);
        expect(res).toStrictEqual([[7,6,5],[5,6,7],[15,14,13]]);
    });
});
