# Hardhat FundMe Sample Project

This projects demonstrates how to use Hardhat to build and test a smart contract that allows users to send ETH to a contract and the contract will keep track of:

- the total amount of ETH sent to the contract
- the users who have sent ETH to the contract
- the user who sent the most high ETH amount to the contract

Only the owner of the contract can withdraw the funds.

## Requirements
- Node.js >= 18.12.1
- NPM >= 8.19.2
- Hardhat >= 2.12.5

## Initialization from scratch
Init a new project:
```shell
npm init -y
```
Install the Hardhat package globally:
```shell
npm install --save-dev hardhat
```
Creates hardhat project
```shell
npx hardhat
```

### Install additional dependencies
```shell
npm install --save-dev solidity-coverage hardhat-gas-reporter @nomiclabs/hardhat-etherscan
```

## Create Secrets

Install dependency
```shell
npm install --save-dev dotenv
```
Create a `.env` file in the root of the project and add the following:
```shell
# Local ganache
GANACHE_RPC_URL=HTTP://127.0.0.1:7545
GANACHE_WALLET_PRIVATE_KEY= __THE_GANACHE_WALLET_PRIVATE_KEY__
GANACHE_CHAIN_ID=1337

# Goerli testnet
GOERLI_RPC_URL=https://eth-goerli.g.alchemy.com/v2/vl_0ADl0f7KX6yODggsVbWVcZyqP1VzB
GOERLI_WALLET_PRIVATE_KEY= __THE_METAMASK_WALLET_PRIVATE_KEY__
GOERLI_CHAIN_ID=5

# API Keys
ETHERSCAN_API_KEY= __THE_ETHERSCAN_API_KEY__
COINMARKETCAP_API_KEY= __THE_COINMARKETCAP_API_KEY__
```
Loads environment variables from a .env file into process.env in the hardhat.config.js file
```js
// Load environment variables
const dotenv = require("dotenv");

if (process.env && process.env.NODE_ENV) {
    dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
    dotenv.config();
}
// Create constants
const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL;
const GANACHE_WALLET_PRIVATE_KEY = process.env.GANACHE_WALLET_PRIVATE_KEY;
const GANACHE_CHAIN_ID = parseInt(process.env.GANACHE_CHAIN_ID);
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const GOERLI_WALLET_PRIVATE_KEY = process.env.GOERLI_WALLET_PRIVATE_KEY;
const GOERLI_CHAIN_ID = parseInt(process.env.GOERLI_CHAIN_ID);
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
```
### Set up hardhat

Adds settings to the `hardhat.config.js` file

```js
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
// loads every task from the tasks folder
require("./tasks/accounts");
// .... more code ....
// Then adds the following to the config object:
module.exports = {
    defaultNetwork: "hardhat",
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
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        currency: "USD",
        enabled: true,
        showTimeSpent: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    solidity: {
        version: "0.8.17", //Solidity compiler version
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
};
```

## Create the smart contract

Into the folder `contracts` create a new file `FundMe.sol` and add the following code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
```

## Create the deployment script

Into the folder `scripts` create a new file `deploy.js` with the related code.

## Compile and run

For compile the project and run execute the following command:

*Note: the `--network` flag is optional and specify the network to be used, if not specified the default network is `hardhat`*

```shell
npx hardhat clean && npx hardhat compile && npx hardhat run scripts/deploy.js --network hardhat
```

## Create tests for the smart contract

Into the folder `test` create a new file `FundMe.test.js` with the related code.

For run the tests execute the following commands:

```shell
npx hardhat test
npx hardhat coverage
```

## Available scripts (Tasks)

```shell
npx hardhat help
npx hardhat test
npx hardhat coverage
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# Author and License
Rafael Chavez - @rcsolis 
MIT License
