//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./SharedStructs.sol";

contract LowFeeCampaign is UsingSharedStructs{

    string public _title;
    string public _quickDescription;
    string public _descriptionUrl;
    string public _logoUrl;
    string public _coverUrl;
    string public _auditUrl;
    uint256 public _coinRate;
    uint256 public _goal;
    uint256 public _startDate;
    uint256 public _endDate;
    uint256 public _score;

    string public _social_facebook_url;
    string public _social_twitter_url;
    string public _social_discord_url;
    string public _social_telegram_url;
    string public _website_url;
    string public _whitepaper_url;

    uint256[] public _investmentsHistory;
    uint256 public _totalInvested;

    enum CampaignStatus { WAITING_VESTING_SETUP, WAITING_TOKEN_TRANSFER, WAITING_REVIEW_REQUEST, REVIEW_IN_PROGRESS, APPROVED, DENIED, SHUTDOWN }

    CampaignStatus public _status;

    string public _reviewNote;

    uint256 public _offerSupply;

    IERC20 public _token;

    //Vesting
    uint256 public _endVestingDate;

    address public _owner;
    address private _zeroFeeAddress = 0x74fDA6B5e26ccC53f50a5cb841c877A875B8B570;

    modifier onlyOwner {
        require(address(msg.sender) == _owner);
        _;
    }
    modifier onlyLowFee {
        require(address(msg.sender) == _zeroFeeAddress);
        _;
    }

    mapping (address => uint256) private _balances;

    constructor(Campaign memory campaign, address owner, IERC20 token) {
        _title = campaign.title;
        _quickDescription = campaign.quickDescription;
        _descriptionUrl = campaign.descriptionUrl;
        _logoUrl = campaign.logoUrl;
        _coverUrl = campaign.coverUrl;
        _auditUrl = campaign.auditUrl;
        _coinRate = campaign.coinRate;
        _goal = campaign.goal;
        _startDate = campaign.startDate;
        _endDate = campaign.endDate;
        _social_facebook_url = campaign.social_facebook_url;
        _social_discord_url = campaign.social_discord_url;
        _social_twitter_url = campaign.social_twitter_url;
        _social_telegram_url = campaign.social_telegram_url;
        _website_url = campaign.website_url;
        _whitepaper_url = campaign.whitepaper_url;
        _owner = owner;
        _token = token;
        _status = CampaignStatus.WAITING_VESTING_SETUP;
    }

    function setupVesting(uint256 periodInDays) onlyOwner public {
        require(periodInDays >= 30, "The vesting period needs to be at least 30 days");
        require(periodInDays <= 365, "The vesting period needs to be at smaller than 365 days");
        require(_status == CampaignStatus.WAITING_VESTING_SETUP, "You can't change the vesting anymore!");
        _endVestingDate = _endDate + (periodInDays*86400000);
        _status = CampaignStatus.WAITING_TOKEN_TRANSFER;
    }

    function checkTokens() onlyOwner public {
        uint256 amount = _token.balanceOf(address(this));
        require(_status == CampaignStatus.WAITING_TOKEN_TRANSFER, "You can't change the token offer!");
        require(amount >= (10**18), "You can't offer less than one token!");
        uint256 publicOffer = amount-(amount*5/1000);
        uint256 fee = amount*5/1000;

        _token.transfer(_zeroFeeAddress, fee);

        _offerSupply += publicOffer;

        _status = CampaignStatus.WAITING_REVIEW_REQUEST;
    }

    function submitToReview() onlyOwner public {
        _status = CampaignStatus.REVIEW_IN_PROGRESS;
    }

    function review(uint score, bool approved, string memory reviewNote, bool signed) onlyLowFee public {
        _score = score;
        if(approved){
            _status = CampaignStatus.APPROVED;
        }else{
            _status = CampaignStatus.DENIED;
        }
        _reviewNote = reviewNote;
        if(signed){
            _auditUrl = "SIGNED_BY_LOWFEE";
        }
    }

    function buy(address buyer) payable external {
        uint256 amountToBuy = msg.value;
        uint256 dexBalance = _token.balanceOf(address(this));
        require(amountToBuy > 0, "You need to send some ether");
        require((amountToBuy/_coinRate) <= dexBalance, "Not enough tokens in the reserve");
        _balances[buyer] += amountToBuy/_coinRate;
        _investmentsHistory.push(amountToBuy/_coinRate);
        _totalInvested += amountToBuy;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function claimTokens() external returns (bool) {
        require(_status == CampaignStatus.APPROVED, "Campaign not approved");
        require(_balances[address(msg.sender)] > 0, "There is no tokens available to withdraw from this address");
        //require(_endVestingDate > block.timestamp, "Locked by vesting"); TODO
        uint amount = _balances[address(msg.sender)];
        _balances[address(msg.sender)] = 0;
        _token.transfer(address(msg.sender), amount);

        return true;
    }

    function getLengthOfInvestments() external view returns (uint){
        return _investmentsHistory.length;
    }
    function getInvestment(uint index) public view returns(uint256){
        return _investmentsHistory[index];
    }
}