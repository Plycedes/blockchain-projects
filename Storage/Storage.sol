// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Storage {
    uint256 favNum;

    struct People {
        uint256 favNum;
        string name;
    }

    mapping(string => uint256) public nameTofavNum;

    People[] public people;

    function store(uint256 _favNUm) public virtual {
        favNum = _favNUm;
    }

    function retrive() public view returns (uint256) {
        return favNum;
    }

    function addPerson(uint256 _num, string memory _name) public {
        people.push(People(_num, _name));
        nameTofavNum[_name] = _num;
    }
}

//calldata: temporary data that can't be modified.
//memory: temporary data that can be modified.
//storage: permanent data that exists beyond functions ex: favNum, default data storage type.
