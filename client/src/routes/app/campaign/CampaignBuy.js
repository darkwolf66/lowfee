import React from "react";
import Loading from "../../../components/layout/Loading";

import {useParams} from 'react-router-dom'

import LowFeeCampaign from "../../../contracts/LowFeeCampaign.json";
import ERC20 from "../../../contracts/ERC20.json";
import {Button, Card, Form} from "react-bootstrap";

import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';

import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import LowFee from "../../../contracts/LowFee.json";
import LowFeeAssets from "../../../contracts/LowFeeAssets.json";

const CampaignStatus = {
    WAITING_VESTING_SETUP: 0,
    WAITING_TOKEN_TRANSFER: 1,
    WAITING_REVIEW_REQUEST: 2,
    REVIEW_IN_PROGRESS: 3,
    APPROVED: 4,
    DENIED: 5,
}


class CampaignBuy extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: {status: true, message: "Loading.."},
            contract: false,
            contractCache: false,
            amount: ""
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.submitOrder = this.submitOrder.bind(this);
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

            const { drizzleState, drizzle } = this.props;

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
                console.log(contractCache.owner)
            }catch (e){
                return reject();
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

            if (contractCache.status > CampaignStatus.WAITING_VESTING_SETUP) {
                contractCache.endVestingDate = await zeroFeeCampaign.methods._endVestingDate().call()
            }
            if (contractCache.status > CampaignStatus.WAITING_TOKEN_TRANSFER) {
                contractCache.offerSupply = await zeroFeeCampaign.methods._offerSupply().call()
            }

            this.state.contractCache = contractCache;
            this.state.contract = zeroFeeCampaign;

            this.state.zeroFeeAssets = new web3.eth.Contract(LowFeeAssets.abi, drizzle.contracts.LowFeeAssets.address)

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
                {this.launchedContracts()}
            </div>
        );
    }
    launchedContracts(){
        return (
            <div className="container mt-4">
                <div className="row">
                    <div className="col-12 col-sm-8">
                        <h3>{this.state.contractCache.title}</h3>
                    </div>
                </div>
                <div className="row">
                    {this.vestingSetup()}
                </div>
                <ToastContainer />
            </div>
        );
    }
    submitButton(){
        return (<Button type="submit" className="btn btn-dark float-end mt-4">Execute Order</Button>);
    }
    vestingSetup(){
        return (
            <div className="col-12 col-sm-12 col-xl-12 col-xxl-12 mt-2">
                <Card>
                    <Card.Body>
                        <Form className="text-start" onSubmit={this.submitOrder}>
                            <Form.Group className="mb-3" controlId="tokenName">
                                <Form.Label>
                                    <h4>Buy tokens</h4>
                                </Form.Label>
                                <div className="row">
                                    <div className="col-06">
                                        <h4>Cost: {this.state.contractCache.coinRate/(10**18)} BNB per {this.state.contractCache.token_symbol}</h4>
                                    </div>
                                </div>
                                <Form.Control type="text" placeholder="Enter the supply you want to offer" name="amount" value={this.state.amount} onChange={this.handleInputChange} />
                                <Form.Text className="text-muted">
                                    We don't charge fees from this transactions! The only fee you're getting is the GAS
                                </Form.Text>
                                {this.calc()}
                                {this.submitButton()}
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        );
    }
    submitOrder(event){
        event.preventDefault();
        const { drizzleState } = this.props;

        this.state.zeroFeeAssets.methods.buyNewAssetFromCampaign(this.state.contractCache.address).send(
            {
                from: drizzleState.accounts[0],
                value: (this.state.amount*(10**18)).toString(),
            }
        )
        .on('receipt', (receipt) => {
            this.state.contractCache.allowance = true;
            window.location = "/my/assets"
            console.log(receipt)
        }).catch((err)=>{
            console.log(err)
        });

    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.state.amount = value;
        this.setState(this.state)
    }
    calc(){
        if(this.state.amount == null || this.state.amount === "" || this.state.amount === 0){
            return null;
        }
        let rate = this.state.contractCache.coinRate/(10**18)
        return (
            <div>
                <hr/>
                <div>
                    <h3>Cost: {this.state.amount} BNB</h3>
                    <h3>Our fee: Zero</h3>
                    <h4>You're buying: {this.state.amount/rate} {this.state.contractCache.token_symbol}</h4>
                    <h5><small>Be aware there is the GAS cost!</small></h5>
                </div>
                <hr/>
            </div>
        );
    }
}

function WithParameters(props) {
    let params = useParams();
    return <CampaignBuy {...props} params={params} />
}
export default WithParameters;