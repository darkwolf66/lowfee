import {Component} from "react";
import {Link} from "react-router-dom";
import {Image} from "react-bootstrap";

class Welcome extends Component {
    render() {
        return (
            <div className="container text-center">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-6 welcome-message text-start">
                        <h1>LowFee Launchpad</h1>
                        <h4>Our main vision is to allow anyone to get access to a good quality launchpad and tools for a very low amount of fees, trying to reach zero fee if possible.</h4>
                        <p>
                            By offering very lower fees, we allow small indie creators who have great ideas to get funded and launched to the sky,
                            trust is not made only based on how much money you have, and if you're able to afford a big amount of fees, we rely on structured ideas and great communication to bring the trust the investors need.
                        </p>
                        <Link to={"/fund-an-idea"} className="btn btn-light mt-5 p-3">
                            <h2 className="pb-0 mb-0">Fund An Idea</h2>
                        </Link >
                        <Link to={"/get-funded"} className="btn btn-light ms-2 mt-5 p-3">
                            <h2 className="pb-0 mb-0">Get Funded</h2>
                        </Link >
                    </div>
                    <div className="col-11 col-xl-6 welcome-message d-sm-none d-lg-block">
                        <Image src={"/images/promo-bg.png"}/>
                    </div>
                </div>
            </div>
        );
    }
}
export default Welcome;
