import React from "react";
import Loading from "../../components/layout/Loading";

import LowFee from "../../contracts/LowFee.json";
import LowFeeCampaign from "../../contracts/LowFeeCampaign.json";
import ERC20 from "../../contracts/ERC20.json";
import {Button, Card, FormControl} from "react-bootstrap";
import {Link} from "react-router-dom";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import LowFeeAssets from "../../contracts/LowFeeAssets.json";
import Countdown from "react-countdown";
import {CopyToClipboard} from "react-copy-to-clipboard/lib/Component";

const CampaignStatus = {
    WAITING_VESTING_SETUP: 0,
    WAITING_TOKEN_TRANSFER: 1,
    WAITING_REVIEW_REQUEST: 2,
    REVIEW_IN_PROGRESS: 3,
    APPROVED: 4,
    DENIED: 5,
}

class MyAssets extends React.Component {
    state = { loading: {status: true, message: "Loading.."}};

    componentDidMount() {
        let web3 = this.props.drizzle.web3;
        let zeroFeeAssets = new web3.eth.Contract(LowFeeAssets.abi, this.props.drizzle.contracts.LowFeeAssets.address)
        zeroFeeAssets.methods.getMyAssetsLength().call({
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
            let zeroFeeAssets = new web3.eth.Contract(LowFeeAssets.abi, this.props.drizzle.contracts.LowFeeAssets.address)
            zeroFeeAssets.methods.getMyAsset(contractIndex).call().then(async (address) => {
                let zeroFeeCampaign = new web3.eth.Contract(LowFeeCampaign.abi, address)
                let contractCache = {};
                contractCache.address = address;
                contractCache.title = await zeroFeeCampaign.methods._title().call()
                contractCache.descriptionUrl = await zeroFeeCampaign.methods._descriptionUrl().call()
                try {
                    contractCache.description = await axios.get(contractCache.descriptionUrl)
                    contractCache.description = contractCache.description.data
                }catch (e){
                    contractCache.description = "This project does not have a valid description!";
                }

                contractCache.logoUrl = await zeroFeeCampaign.methods._logoUrl().call()
                contractCache.coverUrl = await zeroFeeCampaign.methods._coverUrl().call()
                contractCache.auditUrl = await zeroFeeCampaign.methods._auditUrl().call()
                contractCache.coinRate = await zeroFeeCampaign.methods._coinRate().call()
                contractCache.goal = await zeroFeeCampaign.methods._goal().call()
                contractCache.startDate = await zeroFeeCampaign.methods._startDate().call()
                contractCache.endDate = await zeroFeeCampaign.methods._endDate().call()
                contractCache.status = await zeroFeeCampaign.methods._status().call()
                contractCache.token = await zeroFeeCampaign.methods._token().call()
                contractCache.token = new web3.eth.Contract(ERC20.abi, contractCache.token)

                contractCache.token_symbol = await contractCache.token.methods.symbol().call()

                if(contractCache.status > CampaignStatus.WAITING_VESTING_SETUP){
                    contractCache.endVestingDate = await zeroFeeCampaign.methods._endVestingDate().call()
                }
                console.log(contractCache.endVestingDate)
                if(contractCache.status > CampaignStatus.WAITING_TOKEN_TRANSFER){
                    contractCache.offerSupply = await zeroFeeCampaign.methods._offerSupply().call()
                }
                contractCache.myBalance = await zeroFeeCampaign.methods.balanceOf(this.props.drizzleState.accounts[0]).call()

                this.state.contractCache.set(contractCache.address, contractCache)
                this.state.contracts.push(zeroFeeCampaign)
                resolve(contractCache.address);
            })
        })
    }
    render() {
        return (
            <div>
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
                <div className="mt-4">
                    <div className="container mt-4">
                        <div className="row">
                            <div className="col-12 col-sm-8">
                                <h3>My Assets:</h3>
                            </div>
                            <div className="col-12 col-sm-4 text-end">
                                <Link to={"/fund-an-idea"}>Find Ideas to Invest</Link>
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <h3>You haven't invested in any projects/campaigns yet! <br/>You can find projects/campaigns to fund <Link to={"/fund-an-idea"}>here</Link>!</h3>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="container mt-4">
                <div className="row">
                    <div className="col-12 col-sm-8">
                        <h3>My Assets:</h3>
                    </div>
                    <div className="col-12 col-sm-4 text-end">
                        <Link to={"/fund-an-idea"}>Find Ideas to Invest</Link>
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
                offerSupply = <p> Total Supply Offered: {offerSupply}</p>
            }
            console.log(contractCache.endVestingDate)
            let vestingTime = "";
            if(parseInt(contractCache.endVestingDate.toString()) > Date.now()){
                vestingTime = <h5>Time left till you can claim your tokens (Vesting):<br/> <Countdown renderer={({ total, days, hours, minutes, seconds, milliseconds, completed }) => {
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
                        return <span>{daysView}{hoursView}{minutesView}{seconds} Seconds</span>;
                    }
                }} date={parseInt(contractCache.endVestingDate.toString())}/></h5>
            }
            view.push(
                <div className="col-12 col-sm-6 col-xl-6 col-xxl-6 mt-2" key={this.state.contracts[i]._address}>
                    <Card>
                        <Card.Body>
                            <h4>{contractCache.title}</h4>
                            <h5>Vesting Balance: {contractCache.myBalance} {contractCache.token_symbol}</h5>
                            {vestingTime}
                            <div className="mt-2">Project Token Address: (Click to copy)</div>
                            <CopyToClipboard
                                text={this.state.contracts[i]._address}
                                onCopy={
                                    () => toast.success(
                                        "Address successfully copied to clipboard!",
                                        {
                                            position: "bottom-right",
                                            autoClose: 5000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: false,
                                        }
                                    )
                                }
                            >
                                <FormControl className="cursor-pointer" value={this.state.contracts[i]._address} readOnly={true}/>
                            </CopyToClipboard>
                        </Card.Body>
                        <Card.Footer>
                            <Link className="btn btn-dark" to={"/campaign/"+contractCache.address}>Open Campaign</Link>
                            <Button className="btn btn-dark ms-1" onClick={() => {this.claimTokens(this.state.contracts[i])}}>Claim Tokens</Button>
                        </Card.Footer>
                    </Card>
                </div>
            );
        }

        return view;
    }
    claimTokens(contract){
        contract.methods.claimTokens().send({
            from: this.props.drizzleState.accounts[0]
        }).then((receipt)=>{
            console.log(receipt)
        }).catch((e)=>{
            console.log(e)
        })
    }

}

export default MyAssets;