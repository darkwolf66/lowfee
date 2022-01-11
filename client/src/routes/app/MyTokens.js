import React from "react";
import Loading from "../../components/layout/Loading";

import LowFee from "../../contracts/LowFee.json";
import ERC20 from "../../contracts/ERC20.json";
import {Card, FormControl, FormLabel} from "react-bootstrap";
import {Link} from "react-router-dom";
import {CopyToClipboard} from "react-copy-to-clipboard/lib/Component";

import { ToastContainer, toast } from 'react-toastify';

class MyTokens extends React.Component {
    state = { loading: {status: true, message: "Loading.."}};

    componentDidMount() {
        let web3 = this.props.drizzle.web3;
        let zeroFee = new web3.eth.Contract(LowFee.abi, this.props.drizzle.contracts.LowFee.address)
        zeroFee.methods.getMyLaunchedTokensLength().call({
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
            zeroFee.methods.getMyLaunchedToken(contractIndex).call().then(async (token) => {
                let erc20 = new web3.eth.Contract(ERC20.abi, token)
                let contractCache = {};
                contractCache.name = await erc20.methods.name().call()
                contractCache.symbol = await erc20.methods.symbol().call()
                contractCache.totalSupply = await erc20.methods.totalSupply().call()
                console.log(contractCache)
                this.state.contractCache.set(token, contractCache)
                this.state.contracts.push(erc20)
                resolve(token);
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
                                <h3>Your Released Tokens:</h3>
                            </div>
                            <div className="col-12 col-sm-4 text-end">
                                <Link to={"/token/new"}>Launch New Token/Coin</Link>
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <h3>You haven't released any tokens/coins yet! <br/>You can launch a new token <Link to={"/token/new"}>here</Link>!</h3>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="container mt-4">
                <div className="row">
                    <div className="col-12 col-sm-8">
                        <h3>Your Released Tokens:</h3>
                    </div>
                    <div className="col-12 col-sm-4 text-end">
                        <Link to={"/token/new"}>Launch New Token/Coin</Link>
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
            console.log(this.state.contracts[i]._address);
            let contractCache = this.state.contractCache.get(this.state.contracts[i]._address);
            view.push(
                <div className="col-12 col-sm-6 col-xl-6 col-xxl-6 mt-2" key={this.state.contracts[i]._address}>
                    <Card>
                        <Card.Body>
                            <h4>[{contractCache.symbol}] {contractCache.name}</h4>
                            <h6>
                                Total Supply: {(contractCache.totalSupply/(10**18))}
                            </h6>
                            <p>
                                <h4>Address: (Click to copy)</h4>
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
                            </p>
                        </Card.Body>
                    </Card>
                </div>
            );
        }

        return view;
    }
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

export default MyTokens;