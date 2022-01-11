import {Component} from "react";
import {Image} from "react-bootstrap";
import {Link} from "react-router-dom";

class GetFunded extends Component {
    render() {
        return (
            <div className="container text-center">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-6 text-start get-funded-intro">
                        <h1>Time to get your hands dirty!</h1>
                        <h4>We offer a very simple and reliable process to get funded.</h4>

                        <ul className="mt-4">
                            <li>
                                <h5>First of all you will need to launch a token on the BSC network, either a custom one or you can use our <Link to="/tools/token-launcher">token launcher</Link>.</h5>
                                <small>Obs: Tokens released by our <Link to="/tools/token-launcher">token launcher</Link> offer a Security Seal and do not require an Audit</small>
                            </li>
                            <li>
                                <h5>With your token in hands you need to submit your idea and token to our <Link to="/tools/token-launcher">IDO Launchpad</Link></h5>
                                These are the steps for IDO:
                                <ul className="mt-1">
                                    <li>
                                        <p className='mb-0'>
                                            After you submit your IDO request over our launchpad, we will have a period of 72h to review it.
                                        </p>
                                        <small>
                                            The review process accept all projects and works with us analyzing the project and giving a note from 1 to 5.
                                            Projects with note 5 have extra visibility on the platform.
                                        </small>
                                    </li>
                                    <li>
                                        After the project receives feedback, it will go to the investors' dashboard and will be offered as a crowdsale. We don't have a soft or hardcap, only the main goal, also all the money is locked in a safebox till the end of the campaign.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <h5>The last step is launching the pool and collecting the funding. The pool needs to be 60% or more of the funding you collected.</h5>
                            </li>
                            <h4 className="mt-3">The rest is with you, you already have a launched liquidity pool on Pancakeswap where people can trade your coin, the next is step is requesting to be listed on Coinmarketcap and Coingecko and moving forward with your project.</h4>
                        </ul>
                    </div>
                    <div className="col-12 col-xl-6 get-funded-intro text-start">
                        <Image src={"/images/pexels-photo-8370378.jpeg"} className="img-fluid"/>
                    </div>
                    <div className="col-12 text-center">
                        <Link className="btn btn-light" to={"/campaign/launch"}>
                            I already have a token!
                        </Link>
                        <Link className="btn btn-light ms-2" to={"/token/new"}>
                            I want to create a new one!
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
export default GetFunded;
