//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract UsingSharedStructs {
    struct Campaign {
        string title;
        string quickDescription;
        string descriptionUrl;
        string logoUrl;
        string coverUrl;
        string auditUrl;
        uint256 coinRate;
        uint256 goal;
        uint256 startDate;
        uint256 endDate;

        string social_facebook_url;
        string social_twitter_url;
        string social_discord_url;
        string social_telegram_url;
        string website_url;
        string whitepaper_url;
    }
}
