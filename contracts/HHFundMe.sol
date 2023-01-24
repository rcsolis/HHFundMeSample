// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
// Importing an interface for create an instance and call methods 
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// Error definitions
error HHFundMe__EmptyFunderList();
error HHFundMe__TransactionFails();
error HHFundMe__NotOwner(address sender);
error HHFundMe__NotEnoughETH(uint256 amount, uint256 required);
error HHFundMe__InsufficientBalance(uint256 available, uint256 required);

// Declare a library to extend uint256
library NumberParser {
    /**
    * Gets the number using base 1e18
    * @param {uint256} number The uint256 number to parse
    * @return {uint256} Wei equivalent of the number
    */
    function toWeiBase(uint256 number) internal pure returns(uint256){
        return number * 10**18;
    }
}
/**
 * @title HHFundMe
 * @author Rafael Chavez
 * @notice This contract allows to receive funds from funders and withdraw them to the owner
 * @dev This contract is a simple example of how to use Chainlink DataFeed to get the ETH/USD price
 */
contract HHFundMe {
    // Extend the uint256 type with the NumberParser library
    using NumberParser for uint256;
    // Struct to define a transaction
    struct FunderTx {
        uint256 blockId;
        uint256 amount;
        uint256 createdAt;
    }
    // Struct to define a funder
    struct Funder {
        uint256 totalAmount;
        bool initialized;
        FunderTx[] transactions;
    }
    // Chainlink DataFeed
    AggregatorV3Interface public s_priceFeed;
    // Constant for define the minimum quantity of ETH allowed to be received per transfer
    uint256 private constant CMIN_RECIEVE_AMOUNT_USD = 1;
    // Constant for define the minimun quantity of ETH allowed to be withdrawed
    uint256 private constant CMIN_WITHDRAW_AMOUNT_USD = 10;
    // Constant for the owner
    address private immutable i_owner;
    // Funders mapping
    mapping(address => Funder) private s_funders;
    address[] private s_fundersAddr;
    
    // Events for fund and withdraw actions
    event WithdrawEvent(address indexed _from, uint256 _amount);
    event FundEvent(address indexed _from, uint256 _amount);
    // Modifier to ensure that only owner (deployer address) can withdraw funds
    modifier OnlyOwner {
        if(msg.sender != i_owner){
            revert HHFundMe__NotOwner(msg.sender);
        }
        _; // Continue execution
    }

    constructor(address _priceFeed) {
        /**
         * Network: Goerli
         * Aggregator: ETH/USD
         * Address: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
         */
        s_priceFeed = AggregatorV3Interface(
            _priceFeed
        );
        // Save the deploy wallet address as the owner
        i_owner = msg.sender;
    }
    receive() external payable {
        fund();
    }
    fallback() external payable {
        fund();
    }
    /**
    * Fund function
    * @notice This function allows to receive funds from funders
    * @dev This function is payable and it will be called when the contract receives funds
    */
    function fund() public payable{
        uint256 usdReceived = weiToUSD(msg.value);
        console.log("Received %s ETH %s USD", msg.value, usdReceived);
        if( usdReceived < CMIN_RECIEVE_AMOUNT_USD.toWeiBase() ){
            revert HHFundMe__NotEnoughETH({
                amount: usdReceived, 
                required: CMIN_RECIEVE_AMOUNT_USD.toWeiBase()
            });
        }
        // Search if the sender is already a funder
        if( isDuplicated(msg.sender) ){
            s_funders[msg.sender].transactions.push( FunderTx( block.number, msg.value,  block.timestamp) );
            s_funders[msg.sender].totalAmount += msg.value;
        }else{
            s_funders[msg.sender].totalAmount = msg.value;
            s_funders[msg.sender].initialized = true;
            s_funders[msg.sender].transactions.push(FunderTx( block.number, msg.value,  block.timestamp));
            s_fundersAddr.push(msg.sender);
        }
        emit FundEvent(msg.sender, msg.value);
    }
    /**
    * Public function to withdraw current balance
    * @notice This function allows to withdraw the current balance to the owner
    * @dev This function will be called only by the contract owner and it will transfer the balance to the owner
    */
    function withdraw() public OnlyOwner{
        uint256 balance = address(this).balance;
        if( weiToUSD(balance) < CMIN_WITHDRAW_AMOUNT_USD.toWeiBase() ){
            revert HHFundMe__InsufficientBalance({
                available: balance,
                required: CMIN_WITHDRAW_AMOUNT_USD.toWeiBase()
            });
        }
        console.log("Balance before withdraw: %s", balance);
        // We use the payable function to parse the address to payable and transfer the balance
        (bool result, ) = payable(i_owner).call{value: balance}("");
        if(!result){
            revert HHFundMe__TransactionFails();
        }
        emit WithdrawEvent(msg.sender, balance);
    }
    /**
    * Function to get the highest funder
    * @notice This function allows to get the higher funder
    * @dev This function calls the internal function getHighestFunder
    * @return {address} Highest funder
    */
    function highestFunder() public view returns(address){
        if( s_fundersAddr.length == 0){
            revert HHFundMe__EmptyFunderList();
        }
        return getHighestFunder();
    }
    /**
    * Gets the current price of ETH/USD (Chainlink DataFeed)
    * @notice This function allows to get the current price of ETH/USD
    * @dev This function must be called by a payable funciton and will be called when the contract receives funds
    * @return {uint256} Latest price reference
    */
    function getEthToUsdPrice() internal view returns (uint256) {
        (
            /*uint80 roundId*/,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = s_priceFeed.latestRoundData();
        // Parse int to uint, we receive a number with 12 digits like: 158628000000
        // this includes 8 digits from the end that we don't need to include
        // So if we use numbers with 1e18 ( because 1ETH == 1 * 1e18 wei) for the arithmetic operations we need to add 10 ceros
        // Getting something like: 1586280000000000000000
        return uint256(answer * 1e10); // 1e10 == 1**10
    }
    /**
    * Parse wei to usd
    * @notice This function allows to parse wei to usd
    * @dev This function is to parse wei to usd using the current price of ETH/USD (Chainlink DataFeed) and use 1e18 as base
    * @param {uint256} weiAmount Amount to parse
    * @return {uint256} Parsed amount using 1e18 base
    */
    function weiToUSD(uint256 weiAmount) internal view returns(uint256){
        uint256 ethPrice = getEthToUsdPrice();
        return (ethPrice*weiAmount) / 1e18;
    }
    /**
    * Gets the higher funder
    * @notice This function allows to get the higher funder
    * @dev This function is to get the higher funder using the internal funders mapping and itereate over the s_fundersAddr array
    * @return {address} Address of the highest funder
    */
    function getHighestFunder() private view returns(address) {
        uint256 highest = 0;
        uint idx = 0;
        address[] memory memFundersAddr = s_fundersAddr;
        uint fundersAddrLen = memFundersAddr.length;
        for(uint i = 0; i < fundersAddrLen; i++){
            if(s_funders[memFundersAddr[i]].totalAmount > highest){
                highest = s_funders[memFundersAddr[i]].totalAmount;
                idx = i;
            }
        }
        return memFundersAddr[idx];
    }
    /**
    * Helper function to check if an address already is a funder
    * @notice This function allows to check if an address already is a funder
    * @dev This function is to check if an address already is a funder using the internal s_funders mapping
    * @param {address} _sender Address to check
    * @return {boool} Already funder
    */
    function isDuplicated(address _sender) private view returns(bool){
        return s_funders[_sender].initialized;
    }
}