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

const CampaignStatus = {
    WAITING_VESTING_SETUP: 0,
    WAITING_TOKEN_TRANSFER: 1,
    WAITING_REVIEW_REQUEST: 2,
    REVIEW_IN_PROGRESS: 3,
    APPROVED: 4,
    DENIED: 5,
}

class CampaignSetupVesting extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: {status: true, message: "Loading.."},
            vesting: 30,
            contract: false,
            contractCache: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.submitVesting = this.submitVesting.bind(this);
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
            if(drizzleState.accounts[0] !== contractCache.owner){
                window.location = "/campaign/my";
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

            if (contractCache.status > CampaignStatus.WAITING_VESTING_SETUP) {
                contractCache.endVestingDate = await zeroFeeCampaign.methods._endVestingDate().call()
            }
            if (contractCache.status > CampaignStatus.WAITING_TOKEN_TRANSFER) {
                contractCache.endVestingDate = await zeroFeeCampaign.methods._offerSupply().call()
            }
            if (contractCache.status > CampaignStatus.WAITING_TOKEN_TRANSFER) {
                contractCache.offerSupply = await zeroFeeCampaign.methods._offerSupply().call()
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
    vestingSetup(){
        let contractCache = this.state.contractCache
        return (
            <div className="col-12 col-sm-12 col-xl-12 col-xxl-12 mt-2">
                <Card>
                    <Card.Body>
                        <Form className="text-start" onSubmit={this.submitVesting}>
                            <Form.Group className="mb-3" controlId="tokenName">
                                <Form.Label>
                                    <h4>The vesting is a very important part of your token IDO!</h4>
                                    <h5>This will basically define how long the tokens of people who buy will be locked against sale. That is, during this period people who bought in the pre-sales will not be able to sell, keeping your Liquidity Pool without the risk of large sales. It is necessary to consider a balance for this value, because if your vesting period is too high, investors may not want to buy your tokens due to the risk of that period in which they cannot sell.</h5>
                                </Form.Label>
                                <Form.Control type="text" placeholder="Enter the name of your token" name="tokenName" value={this.state.vesting} onChange={this.handleInputChange} />
                                <RangeSlider
                                    value={this.state.vesting}
                                    onChange={this.handleInputChange}
                                    max={365}
                                    min={30}
                                />
                                <Form.Text className="text-muted">
                                    We recommend for everyone a period between 30 to 90 days. But we allow up to 365 days.
                                </Form.Text>
                                <div className="alert alert-warning mt-4">
                                    Be careful, you can only submit once! Everything is done over Blockchain!
                                    <Button type="submit" className="btn btn-dark float-end">I understand and want to submit the vesting setup!</Button>
                                </div>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        );
    }
    submitVesting(event){
        event.preventDefault();
        const { drizzleState } = this.props;
        let web3 = this.props.drizzle.web3;
        let address = this.props.params.address;
        let zeroFeeCampaign = new web3.eth.Contract(LowFeeCampaign.abi, address)

        console.log(drizzleState.accounts[0])

        zeroFeeCampaign.methods.setupVesting(
            this.state.vesting
        ).send(
            {
                from: drizzleState.accounts[0],
            }
        )
        .on('receipt', (receipt) => {
            window.location = "/campaign/"+this.state.contractCache.address;
            console.log(receipt)
        }).catch((err)=>{
            console.log(err)
        });
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.state.vesting = value;
        this.setState(this.state)
    }
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

function WithParameters(props) {
    let params = useParams();
    return <CampaignSetupVesting {...props} params={params} />
}
export default WithParameters;