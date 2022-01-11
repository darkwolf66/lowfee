import {Component} from "react";
import {Image} from "react-bootstrap";
import {Link} from "react-router-dom";

class Fees extends Component {
    render() {
        return (
            <div className="container our-fees">
                <div className="row justify-content-center">
                    <div className="mt-5 text-start row">
                        <div className="col-12">
                            <h1>Our Fees</h1>
                        </div>
                        <div className="col-12 col-xl-4">
                            <h4>We are very clear about our Fees and Costs so here there is a table of an estimation of costs to launch your IDO:</h4>
                            All the numbers are rounded up so there is no surprises
                        </div>
                        <div className="col-12 col-xl-8">
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Token Creation:
                                        </div>
                                        <div className="col-6 text-start">
                                            0.104 BNB
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Campaign Creation:
                                        </div>
                                        <div className="col-6 text-start">
                                            0.107 BNB
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Setup Vesting:
                                        </div>
                                        <div className="col-6 text-start">
                                            0.0002 BNB
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Sending the Tokens to the Campaign Address:
                                        </div>
                                        <div className="col-6 text-start">
                                            Token Supply for your Campaign + 0.0002 BNB<br/>
                                            <small>Obs: We charge 0.5% of the total supply!</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12 text-center">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Checking the Amount Transferred and Submitting:
                                        </div>
                                        <div className="col-6 text-start">
                                            0.0003 BNB
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Requesting Review:
                                        </div>
                                        <div className="col-6 text-start">
                                            0.00009 BNB
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Total Cost Estimated in Fees and GAS:
                                        </div>
                                        <div className="col-6 text-start">
                                            0.21159 BNB
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-6 text-end">
                                            Competitors Average:
                                        </div>
                                        <div className="col-6 text-start">
                                            3 BNB + GAS + 20% of your tokens
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Fees;
