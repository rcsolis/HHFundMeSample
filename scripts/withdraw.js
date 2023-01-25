const hre = require('hardhat');
/**
 * Withdraw from contract
 */
async function main() {
    const { deployer } = await hre.getNamedAccounts();
    const HHFundMe = await hre.ethers.getContract('HHFundMe', deployer);
    console.log('HHFundMe address:', HHFundMe.address);
    const transactionReceipt = await HHFundMe.withdraw();
    await transactionReceipt.wait(1);
    console.log('Withdrawn from contract');
}

main()
    .then()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
