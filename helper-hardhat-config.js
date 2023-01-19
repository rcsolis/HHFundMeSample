const networkConfig = {
    31337: {
        name: 'hardhat',
    },
};
networkConfig[process.env.GANACHE_CHAIN_ID] = {
    name: 'ganache',
};
networkConfig[process.env.GOERLI_CHAIN_ID] = {
    name: 'goerli',
    ethUsdPriceFeedAddress: process.env.GOERLI_ETH_USD_PRICE_FEED,
    blockConfirmations: 6,
};

const developmentChains = ['hardhat', 'ganache', 'localhost'];
const mockPriceFeedArgs = {
    decimals: 8,
    initialAnswer: 20000000000,
};
module.exports = {
    networkConfig,
    developmentChains,
    mockPriceFeedArgs,
};
