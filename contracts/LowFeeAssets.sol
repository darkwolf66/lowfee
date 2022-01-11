//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./LowFeeCampaign.sol";

contract LowFeeAssets {

    address private entityOwner = 0x74fDA6B5e26ccC53f50a5cb841c877A875B8B570;

    mapping(address => LowFeeCampaign[]) public _assets;

    function getMyAssetsLength() public view returns(uint){
        return _assets[address(msg.sender)].length;
    }
    function getMyAsset(uint index) public view returns(LowFeeCampaign){
        return _assets[address(msg.sender)][index];
    }
    function buyNewAssetFromCampaign(LowFeeCampaign campaign) payable external {
        require(msg.value > 0, "You need to add the value you want to buy!");
        campaign.buy{value: msg.value}(msg.sender);
        bool found = false;
        for (uint i=0; i < _assets[msg.sender].length; i++) {
            if(address(_assets[msg.sender][i]) == address(campaign)){
                _assets[msg.sender][i] = campaign;
                found = true;
            }
        }
        if(!found){
            _assets[msg.sender].push(campaign);
        }
    }

}
