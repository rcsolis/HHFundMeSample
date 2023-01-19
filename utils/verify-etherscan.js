const hre = require('hardhat');
/**
 * Verify contract using Etherscan
 * @param {String} contractAddress Deployed contract address
 * @param {Array} contractArgs Contract arguments
 * @return {Promise<void>} Promise with the result of the verification
 */
function verifyUsingEtherscan(contractAddress, contractArgs) {
    return new Promise(async (resolve, reject) => {
        console.log('Verifying contract using Etherscan ...');
        try {
            // Execute verify:verify task
            await hre.run('verify:verify', {
                address: contractAddress,
                constructorArguments: contractArgs,
            });
            console.log('Contract verified');
            resolve();
        } catch (err) {
            if (err.message.toLowerCase().includes('already verified')) {
                console.log('Contract already verified');
                resolve();
            } else {
                console.error(err);
                reject(err);
            }
        }
    });
}

module.exports = {
    verifyUsingEtherscan,
};
