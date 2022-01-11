//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./LFToken.sol";
import "./LowFeeCampaign.sol";
import "./SharedStructs.sol";


contract LowFee is UsingSharedStructs{
    address private entityOwner = 0x74fDA6B5e26ccC53f50a5cb841c877A875B8B570;
    uint256 private _platformFee = 100000000000000000;

    //Owner => Token
    mapping(address => LFToken[]) public _launchedTokens;
    LFToken[] public launchedTokens;

    mapping(address => LowFeeCampaign[]) public _campaigns;
    LowFeeCampaign[] public campaigns;

    function buyNewToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 decimals
    ) public payable {
        require((msg.value >= _platformFee || address(msg.sender) == entityOwner), "You need to enter right fee value!");
        LFToken lastCreatedToken = new LFToken(name, symbol, initialSupply, decimals, address(msg.sender));
        _launchedTokens[address(msg.sender)].push(lastCreatedToken);
        launchedTokens.push(lastCreatedToken);
    }
    function getMyLaunchedTokensLength() public view returns(uint){
        return _launchedTokens[address(msg.sender)].length;
    }
    function getMyLaunchedToken(uint index) public view returns(LFToken){
        return _launchedTokens[address(msg.sender)][index];
    }

    function launchNewCampaign(
        Campaign memory campaign,
        IERC20 token
    ) payable public {
        require(bytes(campaign.title).length > 0, "Title is required!");
        require(bytes(campaign.logoUrl).length > 0, "Logo Url is required!");
        require(bytes(campaign.quickDescription).length > 0, "Quick Description is required!");
        require(bytes(campaign.descriptionUrl).length > 0, "Description url is required!");
        require(keccak256(bytes(campaign.auditUrl)) != keccak256(bytes("SIGNED_BY_LOWFEE")), "You can't use this");
        require(campaign.coinRate >= 1, "Coin Rate is required!");
        require(campaign.goal > 0, "Goal is required!");
        require(campaign.startDate > 0, "Start Date is required!");
        require(campaign.endDate > campaign.startDate, "Start Date needs to be bigger than end date!");
        require((msg.value >= _platformFee || address(msg.sender) == entityOwner), "You need to enter right fee value!");
        LowFeeCampaign zeroFeeCampaign = new LowFeeCampaign(campaign, address(msg.sender), token);
        _campaigns[address(msg.sender)].push(zeroFeeCampaign);
        campaigns.push(zeroFeeCampaign);
    }

    function getMyCampaignsLength() public view returns(uint){
        return _campaigns[address(msg.sender)].length;
    }

    function getMyCampaign(uint index) public view returns(LowFeeCampaign){
        return _campaigns[address(msg.sender)][index];
    }

    modifier onlyLowFee {
        require(address(msg.sender) == entityOwner);
        _;
    }

    function withdrawAll() payable onlyLowFee public {
        require(payable(address(msg.sender)).send(payable(address(this)).balance));
    }

    function changeFee(uint256 newFee) onlyLowFee public {
        _platformFee = newFee;
    }
    function getCampaignsLength() public view returns(uint){
        return campaigns.length;
    }
    function getCampaign(uint index) public view returns(LowFeeCampaign){
        return campaigns[index];
    }
}
