import React, {Component} from "react";
import {Button, Card, Image, OverlayTrigger, ProgressBar, Tooltip} from "react-bootstrap";
import {Link, useParams} from "react-router-dom";
import Loading from "../../components/layout/Loading";
import LowFee from "../../contracts/LowFee.json";
import LowFeeCampaign from "../../contracts/LowFeeCampaign.json";
import axios from "axios";
import ERC20 from "../../contracts/ERC20.json";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar as fasStar, faGlobe as fasGlobe, faFileAlt as fasFileAlt} from "@fortawesome/free-solid-svg-icons";
import {faStar as farStar} from "@fortawesome/free-regular-svg-icons";
import Countdown from "react-countdown";
import {
    faFacebook as fabFacebook,
    faTwitter as fabTwitter,
    faTelegramPlane as fabTelegram,
    faDiscord as fabDiscord,
} from "@fortawesome/free-brands-svg-icons";

const CampaignStatus = {
    WAITING_VESTING_SETUP: 0,
    WAITING_TOKEN_TRANSFER: 1,
    WAITING_REVIEW_REQUEST: 2,
    REVIEW_IN_PROGRESS: 3,
    APPROVED: 4,
    DENIED: 5,
}

class FundAnIdea extends Component {
    constructor() {
        super();
        this.state = {
            loading: {status: true, message: "Loading.."},
            projects: [],
            comingSoonProjects: [],
            availableProjects: [],
            finishedProjects: [],
            projectsLength: 0,
        }
    }
    render() {
        return (
            <div>
                <Loading message={this.state.loading.message} loading={this.state.loading.status}/>
                <div className="container">
                    <div className="row justify-content-center mt-5">
                        <div className="col-12">
                            <h3>Available to Invest: </h3>
                        </div>
                        <div className="col-12 text-center mt-3">
                            {this.getProjectsView()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    componentDidMount() {
        this.fetchInfo().then(r => {
            this.state.loading.status = false;

            //Sorting to the right order
            this.state.comingSoonProjects.sort((a, b) => a.index - b.index);
            this.state.availableProjects.sort((a, b) => a.index - b.index);
            this.state.finishedProjects.sort((a, b) => a.index - b.index);
            this.state.projects.sort((a, b) => a.index - b.index);

            this.setState(this.state)
        })
    }

    fetchInfo(){
        return new Promise(async (resolve, reject) => {
            const {drizzleState} = this.props;
            let web3 = this.props.drizzle.web3;
            let lowFee = new web3.eth.Contract(LowFee.abi, this.props.drizzle.contracts.LowFee.address)

            console.log(lowFee.methods)

            this.state.projectsLength = await lowFee.methods.getCampaignsLength().call();

            if(this.state.projectsLength <= 0){
                return resolve();
            }

            let projectsPromises = [];
            for (let i = this.state.projectsLength-1; i >= 0 ; i--){
                projectsPromises.push(this.getCampaign(lowFee, i))
            }
            let promise = Promise.all(projectsPromises);
            return resolve(promise);
        })
    }
    getCampaign(lowFee, index){
        return new Promise(async (resolve, reject) => {
            let web3 = this.props.drizzle.web3;
            let campaign = await lowFee.methods.getCampaign(index).call()
            campaign = new web3.eth.Contract(LowFeeCampaign.abi, campaign)

            this.cacheCampaignInfo(web3, campaign).then((campaignCache)=>{
                let campaignToPush = {
                    index: index,
                    contract: campaign,
                    cache: campaignCache
                }
                console.log(campaignCache)
                if(campaignCache.status >= CampaignStatus.APPROVED && campaignCache.status < CampaignStatus.DENIED){
                    console.log(campaignCache.startDate)
                    console.log(campaignCache.endDate)
                    console.log(Date.now())
                    if(campaignCache.startDate < Date.now() && campaignCache.endDate > Date.now()){
                        console.log('Added to availableProjects')
                        this.state.availableProjects.push(campaignToPush)
                    }else if(campaignCache.endDate < Date.now()){
                        console.log('Added to finishedProjects')
                        this.state.finishedProjects.push(campaignToPush)
                    }else if(campaignCache.startDate > Date.now()){
                        console.log('Added to comingSoonProjects')
                        this.state.comingSoonProjects.push(campaignToPush)
                    }
                }

                this.state.projects.push(campaignToPush);
                resolve(campaignToPush);
            })

        })
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

    getProjectsView(){
        if(this.state.projectsLength <= 0 && this.state.availableProjects <= 0){
            return (<div>
                <h1>There is no IDO available at the moment</h1>
                <h5>If you want to find a project you've invested in go to <Link to="/my/assets">My Assets</Link></h5>
            </div>);
        }
        let projectsViews = [];

        for (let i = 0; i < this.state.availableProjects.length; i++){
            projectsViews.push(this.projectCard(this.state.availableProjects[i]))
        }

        return (<div className="row">{projectsViews}</div>);
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
                        <Link to={'/campaign/'+project.cache.address}>More</Link>
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

function WithParameters(props) {
    let params = useParams();
    return <FundAnIdea {...props} params={params} />
}
export default WithParameters;