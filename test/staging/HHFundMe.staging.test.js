const { getNamedAccounts, ethers, network } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');
const { assert, expect } = require('chai');

developmentChains.includes(network.name) ? describe.skip :
    describe('HHFundMe Staging Test', async function () {
        let HHFundMe;
        let deployer;
        const amount = ethers.utils.parseEther('1');
        beforeEach(async function () {
            // Fund contract
            deployer = (await getNamedAccounts()).deployer;
            HHFundMe = await ethers.getContract('HHFundMe', deployer);
        });

        it('Allow to fund and withdraw contract', async function () {
            await expect(HHFundMe.fund({ value: amount }))
                .to.emit(HHFundMe, 'FundEvent')
                .withArgs(deployer, amount);
            const balance = await HHFundMe.provider.getBalance(HHFundMe.address);
            assert(balance.eq(ethers.utils.parseEther('1')), 'Initial balance is not correct');
            await expect(HHFundMe.withdraw())
                .to.emit(HHFundMe, 'WithdrawEvent')
                .withArgs(deployer, ethers.utils.parseEther('1'));
        });
    });
