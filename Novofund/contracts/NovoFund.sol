// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NovoFund_NotOwner();

contract NovoFund{
    using PriceConverter for uint256;

    uint256 public constant minUSD = 50 * 1e18;

    address public immutable owner;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    
    AggregatorV3Interface public priceFeed;

    modifier ownerSigil{
        //require(msg.sender == owner, "Sender is not owner");
        if(msg.sender != owner) { revert NovoFund_NotOwner(); }
        _;
    }

    constructor(address priceFeedAddress){
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() payable external{
        fund();
    }

    fallback() payable external{
        fund();
    }

    function fund() public payable{
        require(msg.value.getConversionRate(priceFeed) >= minUSD, "Didn't send enough");
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public ownerSigil{        
        for(uint256 index = 0; index < funders.length; index++){
            address funder = funders[index];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
}