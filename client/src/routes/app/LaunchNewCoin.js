import React from "react";
import {Alert, Button, Card, Form} from "react-bootstrap";

import Loading from "../../components/layout/Loading";
import {useNavigate} from "react-router-dom";

let ERC20 = require('../../contracts/ERC20.json');
let LowFee = require('../../contracts/LowFee.json');

class LaunchNewCoin extends React.Component {
    state = { stackId: null };
    constructor() {
        super();
        this.state.createNewToken = {
            tokenDecimals: 18,
            tokenSupply: 100000000,
            tokenSymbol: "",
            tokenName: ""
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.submitNewTokenCreation = this.submitNewTokenCreation.bind(this);
    }
    getTxStatus = () => {
        // get the transaction states from the drizzle state
        const { transactions, transactionStack } = this.props.drizzleState;
        const { drizzle, drizzleState } = this.props;
        const contract = drizzle.contracts.LowFee;

        // get the transaction hash using our saved `stackId`
        const txHash = transactionStack[this.state.stackId];

        // if transaction hash does not exist, don't display anything
        if (!txHash) return null;

        if(typeof transactions[txHash] == 'undefined'){
            return `In progress`;
        }
        if(transactions[txHash].status === "success"){
            this.state.success();
        }
        if(transactions[txHash].status === "error"){
            this.state.loading = false;
        }
        return `Transaction status: ${transactions[txHash].status}`;
    };

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.state.createNewToken[name] = value;
        this.setState(this.state)
    }

    submitNewTokenCreation(event){
        event.preventDefault();
        const { drizzle, drizzleState } = this.props;
        const contract = drizzle.contracts.LowFee;

        if(this.state.createNewToken.tokenDecimals == null || this.state.createNewToken.tokenDecimals.length <= 0){
            this.state.error = true;
            this.state.error_msg = "You need to enter the decimals!";
            this.setState(this.state)
            return;
        }
        if(this.state.createNewToken.tokenSupply == null || this.state.createNewToken.tokenSupply.length <= 0 || this.state.createNewToken.tokenSupply <= 0){
            this.state.error = true;
            this.state.error_msg = "You need to enter the total supply for your token!";
            this.setState(this.state)
            return;
        }
        if(this.state.createNewToken.tokenSymbol == null || this.state.createNewToken.tokenSymbol.length <= 0){
            this.state.error = true;
            this.state.error_msg = "You need to enter a symbol for your token!";
            this.setState(this.state)
            return;
        }
        if(this.state.createNewToken.tokenName == null || this.state.createNewToken.tokenSymbol.length <= 0){
            this.state.error = true;
            this.state.error_msg = "You need to enter a name for your token!";
            this.setState(this.state)
            return;
        }

        const data = {
            tokenDecimals: this.state.createNewToken.tokenDecimals,
            tokenSupply: this.state.createNewToken.tokenSupply,
            tokenSymbol: this.state.createNewToken.tokenSymbol,
            tokenName: this.state.createNewToken.tokenName
        }


        console.log(drizzleState.accounts[0])
        let fee = 100000000000000000;
        if(drizzleState.accounts[0].toString() == global.env.entityWallet){
            fee = 0;
        }

        const stackId = contract.methods["buyNewToken"].cacheSend(data.tokenName, data.tokenSymbol, data.tokenSupply, data.tokenDecimals, {
            from: drizzleState.accounts[0],
            value: 100000000000000000
        });

        // save the `stackId` for later reference
        this.setState({
            stackId: stackId,
            loading: true,
            success: () => this.successResult()
        });
    }

    successResult(){
        console.log('success!!!!!!!!!!!!!!!!!!'+"/token/my")
        this.props.navigate("/token/my");
    }
    getFormError(){
        if(!this.state.error){
            return null;
        }
        return (
            <Alert variant="danger">{this.state.error_msg}</Alert>
        );
    }
    onFocusFormField(){
        this.state.error = false;
        this.setState(this.state)
    }

    render() {
        return this.tokenCreator();
    }
    tokenCreator(){
        return (
            <div>
                <Loading message={this.getTxStatus()} loading={this.state.loading} />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-10 col-lg-8 col-xl-6 mt-4 text-center mt-5">
                            <h3>Welcome to our token launcher!</h3>
                            <p className="text-start mt-2">
                                Launching token can be pretty simple and safe when using our tool, we always target the safety first!
                                So before launching your token make sure you know the name of your token/coin the Symbol you're going to use and the decimals(keep it 18 if you don't know what is this for).
                            </p>
                        </div>
                        <div className="col-12"></div>
                        <div className="col-12 col-md-10 col-lg-8 col-xl-6 mt-4">
                            {this.getFormError()}
                            <Card>
                                <Card.Body>
                                    <Form className="text-start" onSubmit={this.submitNewTokenCreation}>
                                        <Form.Group className="mb-3" controlId="tokenName">
                                            <Form.Label>The name of your token/coin</Form.Label>
                                            <Form.Control type="text" placeholder="Enter the name of your token" name="tokenName" value={this.state.createNewToken.tokenName} onChange={this.handleInputChange} onFocus={() => this.onFocusFormField()} />
                                            <Form.Text className="text-muted">
                                                Keep it short, like max 32 char
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="tokenSymbol">
                                            <Form.Label>The symbol of your token/coin</Form.Label>
                                            <Form.Control type="text" placeholder="Enter the symbol of your token" name="tokenSymbol" value={this.state.createNewToken.tokenSymbol} onChange={this.handleInputChange} onFocus={() => this.onFocusFormField()} />
                                            <Form.Text className="text-muted">
                                                Keep it short, and make sure does not exist on https://coinmarketcap.com/ and https://coingecko.com
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="tokenSupply">
                                            <Form.Label>The total supply of your token/coin</Form.Label>
                                            <Form.Control type="text" placeholder="Enter the total supply for your token" name="tokenSupply" value={this.state.createNewToken.tokenSupply} onChange={this.handleInputChange} onFocus={() => this.onFocusFormField()} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="tokenDecimals">
                                            <Form.Label>The decimals of your token/coin</Form.Label>
                                            <Form.Control readOnly={true} type="text" placeholder="Enter the decimals of your token" name="tokenDecimals" value={this.state.createNewToken.tokenDecimals} onChange={this.handleInputChange} onFocus={() => this.onFocusFormField()} />
                                        </Form.Group>
                                        <div className="text-end">
                                            <Button className="btn-red" type="submit">
                                                Launch Token
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
function WithNavigate(props) {
    let navigate = useNavigate();
    return <LaunchNewCoin {...props} navigate={navigate} />
}

export default WithNavigate;