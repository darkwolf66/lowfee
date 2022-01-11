//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LFToken is ERC20 {
    constructor(string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 decimals,
        address owner) ERC20(name, symbol) {
        _mint(owner, initialSupply * 10 ** decimals);
    }
}