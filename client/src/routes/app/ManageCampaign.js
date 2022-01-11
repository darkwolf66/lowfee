import React from "react";
import Loading from "../../components/layout/Loading";

import {useParams} from 'react-router-dom'

import LowFeeCampaign from "../../contracts/LowFeeCampaign.json";
import ERC20 from "../../contracts/ERC20.json";
import {Accordion, Badge, Button, Card, Collapse, Nav, OverlayTrigger, Tooltip} from "react-bootstrap";
import {Link} from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCalendar as fasCalendar, faFileAlt as fasFileAlt,
    faGlobe as fasGlobe,
    faShoppingCart,
    faStar as fasStar
} from '@fortawesome/free-solid-svg-icons'
import {faCalendar as farCalendar, faStar as farStar} from '@fortawesome/free-regular-svg-icons'


import {
    faDiscord as fabDiscord,
    faFacebook as fabFacebook,
    faFacebookSquare,
    faInstagram, faTelegramPlane as fabTelegram,
    faTwitter as fabTwitter
} from '@fortawesome/free-brands-svg-icons'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ResponsiveEmbed from "react-responsive-embed";

import axios from "axios";
import Countdown from "react-countdown";

const CampaignStatus = {
    WAITING_VESTING_SETUP: 0,
    WAITING_TOKEN_TRANSFER: 1,
    WAITING_REVIEW_REQUEST: 2,
    REVIEW_IN_PROGRESS: 3,
    APPROVED: 4,
    DENIED: 5,
}

const adminAddress = "0x74fDA6B5e26ccC53f50a5cb841c877A875B8B570";

class ManageCampaign extends React.Component {
    state = { loading: {status: true, message: "Loading.."}};
    constructor() {
        super();
        this.state.contract = false;
        this.state.contractCache = false;
        this.state.collapseContent = "description"
        this.submitToReview = this.submitToReview.bind(this);
    }
    componentDidMount() {
        this.getLaunchedContract().then(r => {
            this.state.loading.status = false;
            this.setState(this.state)
        }).catch((e)=>{
            this.state.error = 404;
            this.setState(this.state);
        });
    }
    getLaunchedContract(){
        return new Promise(async (resolve, reject) => {
            let web3 = this.props.drizzle.web3;
            let address = this.props.params.address;
            let zeroFeeCampaign = new web3.eth.Contract(LowFeeCampaign.abi, address)

            const { drizzleState } = this.props;
            console.log(drizzleState.accounts)

            let contractCache = {};
            contractCache.address = address;
            contractCache.title = await zeroFeeCampaign.methods._title().call()
            contractCache.descriptionUrl = await zeroFeeCampaign.methods._descriptionUrl().call()
            try {
                contractCache.description = await axios.get(contractCache.descriptionUrl)
                contractCache.description = contractCache.description.data
            } catch (e) {
                contractCache.description = "This project does not have a valid description!";
            }
            try {
                contractCache.owner = await zeroFeeCampaign.methods._owner().call()
            }catch (e){
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
            contractCache.startDate = parseInt(contractCache.startDate.toString())
            contractCache.endDate = parseInt(contractCache.endDate.toString())

            contractCache.status = await zeroFeeCampaign.methods._status().call()
            contractCache.token = await zeroFeeCampaign.methods._token().call()

            contractCache.investments_lenght = await zeroFeeCampaign.methods.getLengthOfInvestments().call()
            contractCache.totalInvested = await zeroFeeCampaign.methods._totalInvested().call()

            contractCache.token = new web3.eth.Contract(ERC20.abi, contractCache.token)
            contractCache.token_symbol = await contractCache.token.methods.symbol().call()
            contractCache.token_name = await contractCache.token.methods.name().call()

            if (contractCache.status > CampaignStatus.WAITING_VESTING_SETUP) {
                contractCache.endVestingDate = await zeroFeeCampaign.methods._endVestingDate().call()
            }
            if (contractCache.status > CampaignStatus.WAITING_TOKEN_TRANSFER) {
                contractCache.offerSupply = await zeroFeeCampaign.methods._offerSupply().call()
            }

            if (contractCache.status >= CampaignStatus.APPROVED) {
                contractCache.score = await zeroFeeCampaign.methods._score().call()
                contractCache.reviewNote = await zeroFeeCampaign.methods._reviewNote().call()

                if(isValidHttpUrl(contractCache.reviewNote)){
                    try {
                        contractCache.reviewNote = await axios.get(contractCache.reviewNote)
                        contractCache.reviewNote = contractCache.reviewNote.data
                    } catch (e) {
                        contractCache.reviewNote = "";
                    }
                }

            }

            this.state.contractCache = contractCache;
            this.state.contract = zeroFeeCampaign;

            resolve(contractCache.address);
        })
    }
    render() {
        if(typeof this.state.error != "undefined"){
            window.location = "/campaign/my";
        }
        return (
            <div>
                <Loading message={this.state.loading.message} loading={this.state.loading.status}/>
                {this.campaign()}
            </div>
        );
    }
    adminActions(){
        const { drizzleState } = this.props;
        if(drizzleState.accounts[0] !== adminAddress){
            return null;
        }
        let adminActions = "";
        switch (this.state.contractCache.status.toString()){
            case CampaignStatus.REVIEW_IN_PROGRESS.toString():
                adminActions = (<Link className="btn btn-dark" to={"/campaign/"+this.state.contractCache.address+"/review"}>Admin: Review Campaign</Link>);
                break;
        }
        return adminActions;
    }
    ownerActions(){
        const { drizzleState} = this.props;
        if(drizzleState.accounts[0] !== this.state.contractCache.owner){
            return null;
        }
        let proceedButton = "";
        switch (this.state.contractCache.status.toString()){
            case CampaignStatus.WAITING_VESTING_SETUP.toString():
                proceedButton = (<Link className="btn btn-dark" to={"/campaign/"+this.state.contractCache.address+"/vesting"}>Next: Setup Vesting</Link>);
                break;
            case CampaignStatus.WAITING_TOKEN_TRANSFER.toString():
                proceedButton = (<Link className="btn btn-dark" to={"/campaign/"+this.state.contractCache.address+"/submitTokens"}>Next: Send the Tokens</Link>);
                break;
            case CampaignStatus.WAITING_REVIEW_REQUEST.toString():
                proceedButton = (<Button className="btn btn-dark" onClick={this.submitToReview}>Next: Request Review</Button>);
                break;
            case CampaignStatus.APPROVED.toString():
                //TODO Check if the vesting is ok already
                if(Date.now() > this.state.contractCache.endVestingDate){
                    proceedButton = (<Button className="btn btn-dark" onClick={this.submitToReview}>Next: Claim Sold Tokens</Button>);
                }
                break;
        }
        return proceedButton;
    }

    submitToReview(){
        console.log('Submit to Review')
        const { drizzleState } = this.props;
        this.state.contract.methods.submitToReview().send(
            {
                from: drizzleState.accounts[0],
            }
        )
            .on('receipt', (receipt) => {
                this.state.contractCache.allowance = true;
                window.location.reload()
                console.log(receipt)
            }).catch((err)=>{
            console.log(err)
        });
    }

    openCollapse(collapseContent){
        this.state.collapseContent = collapseContent
        this.setState(this.state);
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
    campaign(){
        console.log(this.state.loading.status)
        if(this.state.loading.status){
            return null;
        }
        let contractCache = this.state.contractCache
        let offerSupply = "";
        if(typeof contractCache.offerSupply !== 'undefined'){
            offerSupply = <div>Total Supply: {(contractCache.offerSupply/(10**18))} {this.state.contractCache.token_symbol}<hr/></div>
        }

        let collapse = null;
        switch (this.state.collapseContent){
            case "description":
                collapse = <div><ReactMarkdown remarkPlugins={[remarkGfm]} >{contractCache.description}</ReactMarkdown></div>;
                break;
            case "audit":
                if(this.state.contractCache.auditUrl == "SIGNED_BY_LOWFEE"){
                    collapse = this.signedAudit()
                }else{
                    collapse = <ResponsiveEmbed src={this.state.contractCache.auditUrl} ratio='1:1' />
                }
                break;
            case "review":
                console.log(this.state.contractCache.score)
                if(this.state.contractCache.status.toString() < CampaignStatus.APPROVED){
                    collapse = <div className="text-center">
                        <h2>This project wasn't reviewed yet!</h2>
                    </div>;
                }else if(typeof this.state.contractCache.reviewNote == 'undefined' || this.state.contractCache.reviewNote.length <= 0){
                    collapse = <div className="text-center">
                        <h2>The Score of this project is: {this.getStarsView(this.state.contractCache.score)}</h2>
                        <h4>No review note attached from ZeroFee for this project</h4>
                    </div>;
                }else {
                    collapse = <div>
                        <h4 className="text-center">The Score of this project is: {this.getStarsView(this.state.contractCache.score)}</h4>
                        <h3 className="mt-5">Review From LowFee:</h3>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} >{this.state.contractCache.reviewNote}</ReactMarkdown>
                    </div>;
                }
                break;
            case "token":
                collapse = <div className="card-dark row">
                    <div className="col-2"><img src={this.state.contractCache.logoUrl} className="img-fluid" alt="Token Logo"/></div>
                    <div className="col-10">
                        <h1>{this.state.contractCache.token_symbol}</h1>
                        <h4>{this.state.contractCache.token_name}<br/>
                        <small>{this.state.contractCache.address}</small></h4>
                        <h5>Total Supply: {contractCache.offerSupply/(10**18)}</h5>
                    </div>
                </div>;
                break;
        }

        let socialLinks = [];

        let websiteLink = this.getProjectCardSocialLink(this.state.contractCache.whitepaper_url, fasGlobe, "Website");
        if(websiteLink != null){
            socialLinks.push(websiteLink);
        }
        let whitepaperLink = this.getProjectCardSocialLink(this.state.contractCache.website_url, fasFileAlt, "Whitepaper");
        if(whitepaperLink != null){
            socialLinks.push(whitepaperLink);
        }
        let facebookLink = this.getProjectCardSocialLink(this.state.contractCache.social_facebook_url, fabFacebook, "Facebook");
        if(facebookLink != null){
            socialLinks.push(facebookLink);
        }
        let twitterLink = this.getProjectCardSocialLink(this.state.contractCache.social_twitter_url, fabTwitter, "Twitter");
        if(twitterLink != null){
            socialLinks.push(twitterLink);
        }
        let telegramLink = this.getProjectCardSocialLink(this.state.contractCache.social_telegram_url, fabTelegram, "Telegram");
        if(telegramLink != null){
            socialLinks.push(telegramLink);
        }
        let discordLink = this.getProjectCardSocialLink(this.state.contractCache.social_discord_url, fabDiscord, "Discord");
        if(discordLink != null){
            socialLinks.push(discordLink);
        }
        socialLinks.push(<a className="bscscan-button" target="_blank" href={'https://bscscan.com/token/'+this.state.contractCache.address}>BscScan</a>)

        return (
            <div>
                <div className="container mt-5 mb-3">
                    <div className="row">
                        <div className="col-12 mb-2">
                            {this.ownerActions()}
                            {this.adminActions()}
                        </div>
                        <div className="col-8">
                            <div className="position-relative">
                                <img className="img-fluid" src={this.state.contractCache.coverUrl} alt={this.state.contractCache.title+" ICO Cover"}/>
                                <div className="social-link-container">
                                    {socialLinks}
                                </div>
                            </div>
                            <h1 className="mt-4 mb-0">
                                {this.state.contractCache.title}
                            </h1>
                            <Nav className="collapse-menu mt-5">
                                <Nav.Link onClick={() => this.openCollapse("description")}>Description</Nav.Link>
                                <Nav.Link onClick={() => this.openCollapse("audit")}>Audit</Nav.Link>
                                <Nav.Link onClick={() => this.openCollapse("review")}>Review</Nav.Link>
                                <Nav.Link onClick={() => this.openCollapse("token")}>Token</Nav.Link>
                            </Nav>
                            <div className="mt-5">
                                {collapse}
                            </div>
                        </div>
                        <div className="col-4">
                            {this.getStatusView()}
                            <hr/>
                            <Countdown renderer={({ total, days, hours, minutes, seconds, milliseconds, completed }) => {
                                if (completed) {
                                    return <Countdown renderer={({ total, days, hours, minutes, seconds, milliseconds, completed }) => {
                                        if (completed) {
                                            return null;
                                        } else {
                                            let daysView = "";
                                            if(days > 0){
                                                daysView = <span>{days} Days, </span>;
                                            }
                                            let hoursView = "";
                                            if(hours > 0){
                                                hoursView = <span>{hours} Hours, </span>;
                                            }
                                            let minutesView = "";
                                            if(minutes > 0){
                                                minutesView = <span>{minutes} Minutes, </span>;
                                            }
                                            return (<div>
                                                <h4>Sales Close In:</h4>
                                                <h5>{daysView}{hoursView}{minutesView}{seconds} Seconds</h5>
                                                <hr/>
                                            </div>);
                                        }
                                    }} date={this.state.contractCache.endDate}/>;
                                } else {
                                    let daysView = "";
                                    if(days > 0){
                                        daysView = <span>{days} Days, </span>;
                                    }
                                    let hoursView = "";
                                    if(hours > 0){
                                        hoursView = <span>{hours} Hours, </span>;
                                    }
                                    let minutesView = "";
                                    if(minutes > 0){
                                        minutesView = <span>{minutes} Minutes, </span>;
                                    }
                                    return (
                                        <h5>
                                            Sales Open In:
                                            <br/>
                                            {daysView}{hoursView}{minutesView}{seconds} Seconds
                                            <hr/>
                                        </h5>
                                    );
                                }
                            }} date={this.state.contractCache.startDate}/>
                            <h4>
                                <FontAwesomeIcon icon={farCalendar} /> Launch Date: {new Date(this.state.contractCache.startDate).toDateString()}
                            </h4>
                            <h4>
                                <FontAwesomeIcon icon={fasCalendar} /> End Date: {new Date(this.state.contractCache.endDate).toDateString()}
                            </h4>
                            <hr/>
                            <h4>
                                Investment Goal: {contractCache.goal} BNB
                            </h4>
                            <h4>
                                Total Raised: {contractCache.totalInvested/(10**18)} BNB
                            </h4>
                            <h4>
                                {offerSupply}
                            </h4>
                            {this.getShareButtons()}
                            {this.getBuyButton()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    getStarsView(stars){
        let starsString = [];
        for (let i = 0; i < stars; i++){
            starsString.push(<FontAwesomeIcon icon={fasStar} className="me-1"/>);
        }
        for (let i = 0; i < 5-stars; i++){
            starsString.push(<FontAwesomeIcon icon={farStar} className="me-1"/>);
        }

        return starsString;
    }
    getCountdown(){
        if(this.state.contractCache.status === CampaignStatus.APPROVED.toString() && (this.state.contractCache.startDate > Date.now())){
            return (<div>
                <h5>Time Until Launch:</h5>
                <h3><Countdown date={parseInt(this.state.contractCache.startDate.toString())}/></h3>
            </div> )
        }
        return null;
    }
    getBuyButton(){
        if(this.state.contractCache.status === CampaignStatus.APPROVED.toString() && (Date.now() > this.state.contractCache.startDate) && (Date.now() < this.state.contractCache.endDate)){
            return (<Link className="btn btn-dark buyButton" to={"/campaign/"+this.state.contractCache.address+"/buy"}><FontAwesomeIcon icon={faShoppingCart} className="me-1"/> Buy Tokens</Link>);
        }
        return null;
    }
    getShareButtons(){
        if(this.state.contractCache.status === CampaignStatus.APPROVED.toString() && (Date.now() > this.state.contractCache.startDate) && (Date.now() < this.state.contractCache.endDate)){
            return (<div className="mb-2">
                <Button className="btn btn-dark" to={"/campaign/"+this.state.contractCache.address+"/buy"}>
                    <FontAwesomeIcon icon={faFacebookSquare} className="me-1"/> Share on Facebook
                </Button>
                <Button className="btn btn-dark ms-2" to={"/campaign/"+this.state.contractCache.address+"/buy"}>
                    <FontAwesomeIcon icon={faInstagram}/> Share on Instagram
                </Button>
            </div>);
        }
        return null;
    }
    signedAudit(){
        return (<div className="text-center">
            <h1>This project have a safe signed token contract by LowFee</h1>
        </div>)
    }
    getStatusView(){
        switch (this.state.contractCache.status.toString()){
            case CampaignStatus.WAITING_VESTING_SETUP.toString():
                return (
                    <h2>Waiting for Vesting Setup</h2>
                );
            case CampaignStatus.WAITING_TOKEN_TRANSFER.toString():
                return (
                    <h2>Waiting for Token Supply Transfer</h2>
                );
            case CampaignStatus.WAITING_REVIEW_REQUEST.toString():
                return (
                    <h2>Waiting for Review Request</h2>
                );
            case CampaignStatus.REVIEW_IN_PROGRESS.toString():
                return (
                    <h2>Campaign Under Review</h2>
                );
            case CampaignStatus.APPROVED.toString():
                if(this.state.contractCache.startDate > Date.now()){
                    return (
                        <h2>Waiting for the Release</h2>
                    );
                }else{
                    return (
                        <h4>Price:<br/> {this.state.contractCache.coinRate/(10**18)} BNB per {this.state.contractCache.token_symbol}</h4>
                    );
                }
            case CampaignStatus.DENIED.toString():
                return (
                    <h2><Badge bg="danger">Campaign Denied</Badge></h2>
                );
        }

    }
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}
const renderTooltip = (msg) => (
    <Tooltip>
        {msg}
    </Tooltip>
);

function WithParameters(props) {
    let params = useParams();
    return <ManageCampaign {...props} params={params} />
}
export default WithParameters;