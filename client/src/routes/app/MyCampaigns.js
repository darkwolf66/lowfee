import React from "react";
import Loading from "../../components/layout/Loading";

import LowFee from "../../contracts/LowFee.json";
import LowFeeCampaign from "../../contracts/LowFeeCampaign.json";
import ERC20 from "../../contracts/ERC20.json";
import {Card, FormControl, OverlayTrigger, ProgressBar, Tooltip} from "react-bootstrap";
import {Link} from "react-router-dom";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt as fasFileAlt, faGlobe as fasGlobe, faStar as fasStar} from "@fortawesome/free-solid-svg-icons";
import {
    faDiscord as fabDiscord,
    faFacebook as fabFacebook,
    faTelegramPlane as fabTelegram,
    faTwitter as fabTwitter
} from "@fortawesome/free-brands-svg-icons";
import Countdown from "react-countdown";
import {faStar as farStar} from "@fortawesome/free-regular-svg-icons";

const CampaignStatus = {
    WAITING_VESTING_SETUP: 0,
    WAITING_TOKEN_TRANSFER: 1,
    WAITING_REVIEW_REQUEST: 2,
    REVIEW_IN_PROGRESS: 3,
    APPROVED: 4,
    DENIED: 5,
}

class MyCampaigns extends React.Component {
    state = { loading: {status: true, message: "Loading.."}};

    componentDidMount() {
        let web3 = this.props.drizzle.web3;
        let zeroFee = new web3.eth.Contract(LowFee.abi, this.props.drizzle.contracts.LowFee.address)

        zeroFee.methods.getMyCampaignsLength().call({
            from: this.props.drizzleState.accounts[0]
        }).then(async (result) => {
            let contractsPromises = [];
            this.state.contracts = [];
            this.state.contractCache = new Map();
            for (let i = 0; i < result; i++) {
                contractsPromises.push(this.getLaunchedContract(i))
            }
            Promise.all(contractsPromises).then((res)=>{
                console.log(this.state.contracts)
                this.state.loading.status = false;
                this.setState(this.state);
            })
        })
    }
    getLaunchedContract(contractIndex){
        return new Promise((resolve, reject)=>{
            let web3 = this.props.drizzle.web3;
            let zeroFee = new web3.eth.Contract(LowFee.abi, this.props.drizzle.contracts.LowFee.address)
            zeroFee.methods.getMyCampaign(contractIndex).call().then(async (address) => {
                let zeroFeeCampaign = new web3.eth.Contract(LowFeeCampaign.abi, address)
                this.cacheCampaignInfo(web3, zeroFeeCampaign).then((contractCache)=>{
                    this.state.contractCache.set(contractCache.address, contractCache)
                    this.state.contracts.push(zeroFeeCampaign)
                    resolve(contractCache.address);
                })
            })
        })
    }

    render() {
        return (
            <div className="your-campaigns">
                <Loading message={this.state.loading.message} loading={this.state.loading.status}/>
                {this.launchedContracts()}
            </div>
        );
    }
    launchedContracts(){
        if(typeof this.state.contracts == 'undefined'){
            return null;
        }else if(this.state.contracts.length <= 0){
            return (
                <div className="mt-4 no-campaign">
                    <div className="container mt-4">
                        <div className="row">
                            <div className="col-12 col-sm-8">
                                <h3>Your Campaigns:</h3>
                            </div>
                            <div className="col-12 col-sm-4 text-end">
                                <Link to={"/campaign/launch"}>Launch New Campaign</Link>
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <h3>You haven't released any campaigns yet! <br/>You can launch a new campaign <Link to={"/campaign/launch"}>here</Link>!</h3>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="container mt-4">
                <div className="row">
                    <div className="col-12 col-sm-8">
                        <h3>My Campaigns:</h3>
                    </div>
                    <div className="col-12 col-sm-4 text-end">
                        <Link to={"/campaign/launch"}>Launch New Campaign</Link>
                    </div>
                </div>
                <div className="row">
                    {this.releasedTokensView()}
                </div>
                <ToastContainer />
            </div>
        );
    }
    releasedTokensView(){
        let view = [];

        for (let i = 0; i < this.state.contracts.length; i++){
            let contractCache = this.state.contractCache.get(this.state.contracts[i]._address);

            let offerSupply = "";
            if(typeof contractCache.offerSupply !== 'undefined'){
                offerSupply = "<p> Total Supply Offered: "+offerSupply+"</p>"
            }
            view.push(this.projectCard({cache: contractCache}));
        }

        return view;
    }

    cacheCampaignInfo(web3, zeroFeeCampaign){
        return new Promise(async (resolve, reject) => {
            let contractCache = {};
            contractCache.address = zeroFeeCampaign._address;

            contractCache.title = await zeroFeeCampaign.methods._title().call()
            contractCache.quickDescription = await zeroFeeCampaign.methods._quickDescription().call()

            contractCache.descriptionUrl = await zeroFeeCampaign.methods._descriptionUrl().call()
            try {
                contractCache.description = await axios.get(contractCache.descriptionUrl)
                contractCache.description = contractCache.description.data
            } catch (e) {
                contractCache.description = "This project does not have a valid description!";
            }
            try {
                contractCache.owner = await zeroFeeCampaign.methods._owner().call()
                console.log(contractCache.owner)
            } catch (e) {
                return reject();
            }

            contractCache.logoUrl = await zeroFeeCampaign.methods._logoUrl().call()
            contractCache.coverUrl = await zeroFeeCampaign.methods._coverUrl().call()
            contractCache.auditUrl = await zeroFeeCampaign.methods._auditUrl().call()

            contractCache.social_facebook_url = await zeroFeeCampaign.methods._social_facebook_url().call()
            contractCache.social_twitter_url = await zeroFeeCampaign.methods._social_twitter_url().call()
            contractCache.social_telegram_url = await zeroFeeCampaign.methods._social_telegram_url().call()
            contractCache.social_discord_url = await zeroFeeCampaign.methods._social_discord_url().call()
            contractCache.website_url = await zeroFeeCampaign.methods._website_url().call()
            contractCache.whitepaper_url = await zeroFeeCampaign.methods._whitepaper_url().call()

            contractCache.coinRate = await zeroFeeCampaign.methods._coinRate().call()
            contractCache.goal = await zeroFeeCampaign.methods._goal().call()
            contractCache.startDate = await zeroFeeCampaign.methods._startDate().call()
            contractCache.endDate = await zeroFeeCampaign.methods._endDate().call()
            contractCache.status = await zeroFeeCampaign.methods._status().call()
            contractCache.token = await zeroFeeCampaign.methods._token().call()
            contractCache.token = new web3.eth.Contract(ERC20.abi, contractCache.token)

            contractCache.status = parseInt(contractCache.status)
            contractCache.startDate = parseInt(contractCache.startDate)
            contractCache.endDate = parseInt(contractCache.endDate)

            contractCache.token_symbol = await contractCache.token.methods.symbol().call()
            contractCache.token_name = await contractCache.token.methods.name().call()


            contractCache.investments_lenght = await zeroFeeCampaign.methods.getLengthOfInvestments().call()
            contractCache.totalInvested = await zeroFeeCampaign.methods._totalInvested().call()

            if (contractCache.status > CampaignStatus.WAITING_VESTING_SETUP) {
                contractCache.endVestingDate = await zeroFeeCampaign.methods._endVestingDate().call()
            }
            if (contractCache.status > CampaignStatus.WAITING_TOKEN_TRANSFER) {
                contractCache.endVestingDate = await zeroFeeCampaign.methods._offerSupply().call()
            }
            if (contractCache.status > CampaignStatus.WAITING_TOKEN_TRANSFER) {
                contractCache.offerSupply = await zeroFeeCampaign.methods._offerSupply().call()
            }

            if (contractCache.status >= CampaignStatus.APPROVED) {
                contractCache.score = await zeroFeeCampaign.methods._score().call()
                contractCache.reviewNote = await zeroFeeCampaign.methods._reviewNote().call()
                try {
                    contractCache.reviewNote = await axios.get(contractCache.reviewNote)
                    contractCache.reviewNote = contractCache.reviewNote.data
                } catch (e) {
                    contractCache.reviewNote = "";
                }

            }
            resolve(contractCache);
        })
    }
    getProjectCardSocialLink(socialLink, fa, tooltipMsg = "Link"){
        if(typeof socialLink != 'undefined' && socialLink !== "" && socialLink != null){
            return (<OverlayTrigger
                placement="top"
                overlay={renderTooltip(tooltipMsg)}
            >
                <a href={socialLink} target="_blank" className="social-link"><FontAwesomeIcon icon={fa}/></a>
            </OverlayTrigger>);
        }
        return null;
    }
    projectCard(project){

        let socialLinks = [];

        let websiteLink = this.getProjectCardSocialLink(project.cache.whitepaper_url, fasGlobe, "Website");
        if(websiteLink != null){
            socialLinks.push(websiteLink);
        }
        let whitepaperLink = this.getProjectCardSocialLink(project.cache.website_url, fasFileAlt, "Whitepaper");
        if(whitepaperLink != null){
            socialLinks.push(whitepaperLink);
        }
        let facebookLink = this.getProjectCardSocialLink(project.cache.social_facebook_url, fabFacebook, "Facebook");
        if(facebookLink != null){
            socialLinks.push(facebookLink);
        }
        let twitterLink = this.getProjectCardSocialLink(project.cache.social_twitter_url, fabTwitter, "Twitter");
        if(twitterLink != null){
            socialLinks.push(twitterLink);
        }
        let telegramLink = this.getProjectCardSocialLink(project.cache.social_telegram_url, fabTelegram, "Telegram");
        if(telegramLink != null){
            socialLinks.push(telegramLink);
        }
        let discordLink = this.getProjectCardSocialLink(project.cache.social_discord_url, fabDiscord, "Discord");
        if(discordLink != null){
            socialLinks.push(discordLink);
        }

        let footer = (<Card.Footer>
            <Link to={'/campaign/'+project.cache.address}>More</Link>
        </Card.Footer>);
        if(socialLinks.length > 0){
            footer = (<Card.Footer>
                <div className="row">
                    <div className="col-7 text-start">
                        {socialLinks}
                    </div>
                    <div className="col-5">
                        <Link to={'/campaign/'+project.cache.address}>Manage</Link>
                    </div>
                </div>
            </Card.Footer>);
        }


        return (<div className="col-12 col-lg-4" key={project.cache.address}>
            <div className="card project-list-card-item">
                <div className="position-relative">
                    <img className="card-img-top" src={project.cache.coverUrl} alt={project.cache.title + " Logo"}/>
                    <div className="stars-container">
                        {this.getStarsView(project.cache.score)}
                    </div>
                </div>
                <ProgressBar now={((project.cache.totalInvested/(10**18))*100)/project.cache.goal} />
                <div className="card-body">
                    <h4><Link to={'/campaign/'+project.cache.address}>{project.cache.title}</Link></h4>
                    <h6 className="text-start mb-1">{project.cache.quickDescription}</h6>
                    <hr/>
                    <div className="row">
                        <div className="col-6 text-start" key={1+"-"+project.cache.address}>
                            {project.cache.coinRate/(10**18)} BNB per {project.cache.token_symbol}
                        </div>
                        <div className="col-6 text-end" key={2+"-"+project.cache.address}>
                            Ends in: <Countdown date={project.cache.endDate}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6 text-start" key={1+"-"+project.cache.address}>
                            Goal is {project.cache.goal} BNB
                        </div>
                        <div className="col-6 text-end" key={2+"-"+project.cache.address}>
                            Total Raised: {project.cache.totalInvested/(10**18)} BNB
                        </div>
                    </div>
                </div>
                {footer}
            </div>
        </div>)
    }
    getStarsView(stars){
        let starsString = [];
        for (let i = 0; i < stars; i++){
            starsString.push(<FontAwesomeIcon icon={fasStar} key={(Math.random()*(0-1000000))+""+i+""+Date.now()} className="me-1"/>);
        }
        for (let i = 0; i < 5-stars; i++){
            starsString.push(<FontAwesomeIcon icon={farStar} key={(Math.random()*(0-1000000))+""+i+""+Date.now()} className="me-1"/>);
        }
        return starsString;
    }
}

const renderTooltip = (msg) => (
    <Tooltip>
        {msg}
    </Tooltip>
);

export default MyCampaigns;