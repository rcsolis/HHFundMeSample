require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');
// loads tasks
require('./tasks/accounts');
// Load environment variables
const dotenv = require('dotenv');

if (process.env && process.env.NODE_ENV) {
    dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
    dotenv.config();
}
// Create constants
const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL || '';
const GANACHE_WALLET_PRIVATE_KEY = process.env.GANACHE_WALLET_PRIVATE_KEY || '';
const GANACHE_CHAIN_ID = parseInt(process.env.GANACHE_CHAIN_ID);

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || '';
const GOERLI_WALLET_PRIVATE_KEY = process.env.GOERLI_WALLET_PRIVATE_KEY || '';
const GOERLI_CHAIN_ID = parseInt(process.env.GOERLI_CHAIN_ID);

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {}, // Chain ID 31337
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [GOERLI_WALLET_PRIVATE_KEY],
            chainId: GOERLI_CHAIN_ID,
        },
        ganache: {
            url: GANACHE_RPC_URL,
            accounts: [GANACHE_WALLET_PRIVATE_KEY],
            chainId: GANACHE_CHAIN_ID,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        currency: 'USD',
        enabled: true,
        showTimeSpent: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: 'ETH',
    },
    solidity: {
        version: '0.8.17',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
};
