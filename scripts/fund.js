const hre = require('hardhat');

/**
 * Function main
 */
async function main() {
    const { deployer } = await hre.getNamedAccounts();
    const HHFundMe = await hre.ethers.getContract('HHFundMe', deployer);
    console.log('HHFundMe address:', HHFundMe.address);
    const transactionReceipt = await HHFundMe.fund({ value: hre.ethers.utils.parseEther('0.1') });
    await transactionReceipt.wait(1);
    console.log('Funded contract');
}

main()
    .then()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
