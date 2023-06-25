// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NovoFund_NotOwner();

contract NovoFund{
    using PriceConverter for uint256;

    uint256 public constant minUSD = 50 * 1e18;

    address public immutable i_owner;
    address[] public s_funder;
    mapping(address => uint256) public s_addressToAmountFunded;
    
    AggregatorV3Interface public s_priceFeed;

    modifier ownerSigil{
        //require(msg.sender == i_owner, "Sender is not owner");
        if(msg.sender != i_owner) { revert NovoFund_NotOwner(); }
        _;
    }

    constructor(address priceFeedAddress){
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() payable external{
        fund();
    }

    fallback() payable external{
        fund();
    }

    function fund() public payable{
        require(msg.value.getConversionRate(s_priceFeed) >= minUSD, "Didn't send enough");
        s_funder.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable ownerSigil{        
        for(uint256 index = 0; index < s_funder.length; index++){
            address funder = s_funder[index];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funder = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable ownerSigil{
        address[] memory funders =  s_funder;

        for(uint256 index = 0; index < funders.length; index++){
            address funder = funders[index];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funder = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
}