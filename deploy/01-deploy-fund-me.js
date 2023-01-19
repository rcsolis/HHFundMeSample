const { networkConfig, developmentChains } = require('../helper-hardhat-config');
const { verifyUsingEtherscan } = require('../utils/verify-etherscan');
/**
 * Function to deploy the FundMe contract
 * @param {Object} hre Hardhat Runtime Environment
 */
module.exports = async (hre) => {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const networkName = network.name;

    log(`** Starting FundMe contract deployment to network: ${chainId} ${networkConfig[chainId].name} `);
    log('** Deployer: ' + deployer);
    let ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress || '';
    // Check if we are in a development chain
    if (developmentChains.includes(networkName)) {
        // If we are in a development chain, we deploy a mock price feed
        const mockPriceFeed = await deployments.get('MockV3Aggregator');
        ethUsdPriceFeedAddress = mockPriceFeed.address;
    }
    log('** Price feed address: ' + ethUsdPriceFeedAddress);
    // Deploy the FundMe contract
    const fundMeContract = await deploy('HHFundMe', {
        contract: 'HHFundMe',
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfiarmations: networkConfig[chainId].blockConfirmations || 1,
    });
    log('** FundMe contract deployed successfully to: ' + fundMeContract.address);
    // Verify the contract in Etherscan
    if (!developmentChains.includes(networkName) && !process.env.ETHERSCAN_API_KEY) {
        try {
            await verifyUsingEtherscan(fundMeContract.address, [ethUsdPriceFeedAddress]);
            log('** FundMe contract verified successfully in Etherscan');
        } catch (err) {
            log('** Error verifying FundMe contract in Etherscan');
            log(err);
        }
    } else {
        log('** Skipping contract verification in Etherscan');
    }

    log('------------------------------------');
};
module.exports.tags = ['all', 'FundMe'];
