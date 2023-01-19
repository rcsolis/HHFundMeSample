const { network } = require('hardhat');
const { developmentChains, mockPriceFeedArgs } = require('../helper-hardhat-config');

module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log('** Deploying MOCKS to network: ' + network.config.chainId + ' ' + network.name);
        await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            args: [mockPriceFeedArgs.decimals, mockPriceFeedArgs.initialAnswer],
            log: true,
        });
        log('** Mocks deployed successfully');
        log('---------------------------------');
    }
};

module.exports.tags = ['all', 'mocks'];
