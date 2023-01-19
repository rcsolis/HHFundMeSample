const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { assert, expect } = require('chai');

describe('Test HHFundMe contract', async function () {
    let HHFundMe;
    let deployer;
    let mockV3Aggregator;

    beforeEach(async function () {
        // Deploy using hardhat-deploy plugin with fixture support
        // use the tag 'all' to deploy all contracts
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(['all']);
        HHFundMe = await ethers.getContract('HHFundMe', deployer);
        mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer);
    });

    describe('Test the constructor', async function () {
        it('Should set the correct price feed address', async function () {
            const priceFeedAddress = await HHFundMe.priceFeed();
            assert.equal(priceFeedAddress, mockV3Aggregator.address);
        });
    });

    describe('Test fund function', async function () {
        it('Should revert if the amount you send does not be enough', async function () {
            const amount = ethers.utils.parseEther('0.000001');
            await expect(HHFundMe.fund({ value: amount })).to.be.reverted;
        });
        it('Should receive the amount and emits the FundEvent event', async function () {
            const amount = ethers.utils.parseEther('0.01');
            await expect(HHFundMe.fund({ value: amount }))
                .to.emit(HHFundMe, 'FundEvent')
                .withArgs(deployer, amount);
        });
    });

    describe('Test GetHigher', async function () {
        it('Should fail when does not exists any funder', async function () {
            await expect(HHFundMe.highestFunder()).to.be.reverted;
        });
        it('Should the highest funder be the deployer', async function () {
            const amount = ethers.utils.parseEther('0.01');
            await HHFundMe.fund({ value: amount });
            const highestFunder = await HHFundMe.highestFunder();
            assert.equal(highestFunder, deployer);
        });
    });

    describe('Test Withdraw', async function () {
        beforeEach(async function () {
            const amount = ethers.utils.parseEther('0.05');
            await HHFundMe.fund({ value: amount });
        });
        it('Should withdraw the balance', async function () {
            const startingContractBalance = await HHFundMe.provider.getBalance(HHFundMe.address);
            const startingDeployerBalance = await HHFundMe.provider.getBalance(deployer);

            const transaction = await HHFundMe.withdraw();
            const receipt = await transaction.wait(1);
            const { gasUsed, effectiveGasPrice } = receipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingContractBalance = await HHFundMe.provider.getBalance(HHFundMe.address);
            const endingDeployerBalance = await HHFundMe.provider.getBalance(deployer);

            assert.equal(endingContractBalance, 0);
            assert.equal(
                startingContractBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );
        });
        it('Shoudl emit the WithdrawEvent event', async function () {
            const balance = await HHFundMe.provider.getBalance(HHFundMe.address);
            assert(balance.eq(ethers.utils.parseEther('0.05')), 'Initial balance is not correct');
            await expect(HHFundMe.withdraw())
                .to.emit(HHFundMe, 'WithdrawEvent')
                .withArgs(deployer, ethers.utils.parseEther('0'));
        });

        it('Should revert if the contract doesn\'t have enough funds', async function () {
            const balance = await HHFundMe.provider.getBalance(HHFundMe.address);
            assert(balance.eq(ethers.utils.parseEther('0.05')), 'Initial balance is not correct');
            await HHFundMe.withdraw();
            await expect(HHFundMe.withdraw()).to.be.reverted;
        });
    });
});
