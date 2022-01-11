import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Button, Card, Form, Image} from "react-bootstrap";
import LowFee from "../../../contracts/LowFee.json";
import ERC20 from "../../../contracts/ERC20.json";
import remarkGfm from "remark-gfm";

class CampaignLauncher extends Component {

    constructor() {
        super();
        this.state = {
            launch: {
                tokenAddress: "0x1beC1399Ff20D72c21f27205105340b376d1cC15",
                title: "Esylium MMORPG",
                quickDescription: "I cool project right here lalaland.",
                descriptionUrl: "https://gist.githubusercontent.com/canadianwealth/91971d4a9741c5438a03dcebe65571b8/raw/3e113a1ce80c96ad3a4cf8d42505e406997a8a27/gistfile1.txt",
                logoUrl: "https://dummyimage.com/500x500/000/fff&text=MyTokenLogo",
                coverUrl: "https://dummyimage.com/1000x400/000/fff&text=Project+Cover",
                auditUrl: "http://www.africau.edu/images/default/sample.pdf",
                coinRate: 0.001,
                goal: 1000,
                startDate: 1622233314000,
                endDate: 1640722914000,
                social_facebook_url: "https://facebook.com/esylium",
                social_twitter_url: "https://t.co/esylium",
                social_telegram_url: "https://t.m/esylium",
                social_discord_url: "https://discord.gg/esylium",
                website_url: "https://esylium.com",
                whitepaper_url: "https://esylium.com/whitepaper.pdf",
            }
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.launch = this.launch.bind(this);
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.state.launch[name] = value;
        this.setState(this.state)
    }

    getCostRate(){
        if(this.state.launch.coinRate == null){
            return (
                <div>
                    You need to enter a coin rate!
                </div>
            )
        }
        return (
            <div>
                1 Your token cost: {this.state.launch.coinRate} BNB<br/>
                1 BNB buy: {1/this.state.launch.coinRate} of your token
            </div>
        )
    }

    launch(event){
        event.preventDefault();
        const { drizzleState } = this.props;
        let web3 = this.props.drizzle.web3;
        let zeroFee = new web3.eth.Contract(LowFee.abi, this.props.drizzle.contracts.LowFee.address)

        console.log(drizzleState.accounts[0])
        let fee = 100000000000000000;
        if(drizzleState.accounts[0].toString() == global.env.entityWallet){
            fee = 0;
        }
        /*
        social_facebook_url: "https://facebook.com/esylium",
                social_twitter_url: "https://t.co/esylium",
                social_discord_url: "https://discord.gg/esylium",
                social_telegram_url: "https://t.m/esylium",
                website_url: "https://esylium.com",
                whitepaper_url: "https://esylium.com/whitepaper.pdf",
         */
        zeroFee.methods.launchNewCampaign(
            {
                title: this.state.launch.title,
                quickDescription: this.state.launch.quickDescription,
                descriptionUrl: this.state.launch.descriptionUrl,
                logoUrl: this.state.launch.logoUrl,
                coverUrl: this.state.launch.coverUrl,
                auditUrl: this.state.launch.auditUrl,
                coinRate: (this.state.launch.coinRate*(10**18)).toString(),
                goal: this.state.launch.goal,
                startDate: this.state.launch.startDate,
                endDate: this.state.launch.endDate,
                social_facebook_url: this.state.launch.social_facebook_url,
                social_twitter_url: this.state.launch.social_twitter_url,
                social_telegram_url: this.state.launch.social_telegram_url,
                social_discord_url: this.state.launch.social_discord_url,
                website_url: this.state.launch.website_url,
                whitepaper_url: this.state.launch.whitepaper_url
            },
            this.state.launch.tokenAddress
        ).send(
            {
                from: drizzleState.accounts[0],
                value: fee,
            }
        )
        .on('receipt', (receipt) => {
            console.log(receipt)
            window.location = "/campaign/my";
        }).catch((err)=>{
            console.log(err)
        });
    }

    render() {
        return (
            <div className="container text-center">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8 col-xl-6 mt-4">
                        <h1>LowFee IDO Crowdfunding Campaign Launcher</h1>
                        <h5>You're about to launch your idea to the sky, make sure you read every single section and have the proper time to decide the information you're going to input! <b>We are not responsible</b> for wrong data send to the blockchain, so be very careful!</h5>
                    </div>
                    <div className="col-12"/>
                    <div className="col-12 col-md-10 col-lg-8 col-xl-6 mt-4">
                        <Card>
                            <Card.Body>
                                <Form className="text-start" onSubmit={this.launch}>
                                    <Form.Group className="mb-3" controlId="tokenAddress">
                                        <Form.Label>Enter your token address</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the address of the token of your campaign" name="tokenAddress" value={this.state.launch.tokenAddress} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            If your want to use a token launched from your token launcher, you can see your tokens <Link target="_blank" to="/token/my">here</Link>, if you don't have a token yet you can create one <Link target="_blank" to="/token/new">here</Link>.
                                        </Form.Text>
                                    </Form.Group>
                                    <hr/>
                                    <h4>Project Information</h4>
                                    <Form.Group className="mb-3" controlId="title">
                                        <Form.Label>Title of Your Project</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the title of your project" name="title" value={this.state.launch.title} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Keep it short, like max 120 characters. Projects with big titles or titles who does not make sense get lower scores on the review.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="quickDescription">
                                        <Form.Label>Quick Description</Form.Label>
                                        <Form.Control type="text" placeholder="Enter a quick description of your project, max of 256 characters." name="quickDescription" value={this.state.launch.quickDescription} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            This will be the first description people will see when navigating though the projects on our platform. So you need to pretty much sell your idea here.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="descriptionUrl">
                                        <Form.Label>Dynamic Description</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the text file url for your description" name="descriptionUrl" value={this.state.launch.descriptionUrl} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Upload the text to gist or to any other hosting as text file and paste the url here. (<b>Needs to be RAW text file with Markdown with remarkGfm allowed</b>).
                                            Projects without proper description get low score on the review.
                                        </Form.Text>
                                    </Form.Group>
                                    <hr/>
                                    <h4>Project Visual Links</h4>
                                    <Form.Group className="mb-3" controlId="logoUrl">
                                        <Form.Label>Logo</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the url for your coin logo" name="logoUrl" value={this.state.launch.logoUrl} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Preferably a url of a .png or .jpg squared file. Projects without proper logo get low score on the review.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="coverUrl">
                                        <Form.Label>Cover Image</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the url for your campaign cover" name="logoUrl" value={this.state.launch.coverUrl} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Preferably a url of a .png or .jpg rectangle (1000x400) file. Projects without proper logo get low score on the review.
                                        </Form.Text>
                                    </Form.Group>
                                    <hr/>
                                    <h4>Project Information Links</h4>
                                    <Form.Group className="mb-3" controlId="auditUrl">
                                        <Form.Label>Audit</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the URL or leave empty if you created the token with our launcher" name="auditUrl" value={this.state.launch.auditUrl} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Url of a uploaded .pdf file. Projects without audit get lower score on the review. If you created the token with our launcher you will automatically get the Secure Seal on the campaign.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="website_url">
                                        <Form.Label>Website</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the URL or leave it empty" name="website_url" value={this.state.launch.website_url} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Please enter the url for your website if you have one. Projects without website normally bring less trust, and get lower scores.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="whitepaper_url">
                                        <Form.Label>Whitepaper</Form.Label>
                                        <Form.Control type="text" placeholder="Enter for your whitepaper pdf" name="whitepaper_url" value={this.state.launch.whitepaper_url} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Please enter the url for your whitepaper pdf, projects without whitepaper may get lower score if the project is not well described on the website or description.
                                        </Form.Text>
                                    </Form.Group>

                                    <hr/>
                                    <h4>Social</h4>
                                    <Form.Group className="mb-3" controlId="social_facebook_url">
                                        <Form.Label>Facebook Page</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the URL or leave it empty" name="social_facebook_url" value={this.state.launch.social_facebook_url} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Please enter the url for your facebook page if you have one.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="social_twitter_url">
                                        <Form.Label>Twitter Page</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the URL or leave it empty" name="social_twitter_url" value={this.state.launch.social_twitter_url} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Please enter the url for your twitter page if you have one.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="social_discord_url">
                                        <Form.Label>Discord Invite</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the URL or leave it empty" name="social_discord_url" value={this.state.launch.social_discord_url} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Please enter the url for the invite of your discord channel if you have one.
                                        </Form.Text>
                                    </Form.Group>

                                    <hr/>
                                    <h4>Fundraising Details</h4>
                                    <Form.Group className="mb-3" controlId="coinRate">
                                        <Form.Label>Coin Rate (BNB)</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the price of each of your token in BNB" name="coinRate" value={this.state.launch.coinRate} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            {this.getCostRate()}
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="goal">
                                        <Form.Label>Campaign Goal</Form.Label>
                                        <Form.Control type="text" placeholder="Enter the Goal for your campaign in BNB." name="goal" value={this.state.launch.goal} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            The goal for your campaign is the minimum you want to achieve. This does not limit your campaign, is just used as a parameter to determinate if your campaign achieved the objective or not.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="goal">
                                        <Form.Label>Enter the date and time you want your campaign to <b>start</b></Form.Label>
                                        <Form.Control type="text" placeholder="Enter the date and time here (dd/mm/yyyy hh:mm:ss)" name="startDate" value={this.state.launch.startDate} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            We do require 72 hours to review your campaign, so your starting date needs to be at least 3 days from now!
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="goal">
                                        <Form.Label>Enter the date and time you want your campaign to <b>end</b></Form.Label>
                                        <Form.Control type="text" placeholder="Enter the date and time here (dd/mm/yyyy hh:mm:ss)" name="endDate" value={this.state.launch.endDate} onChange={this.handleInputChange} />
                                        <Form.Text className="text-muted">
                                            Your end date needs to be bigger than your start date.
                                        </Form.Text>
                                    </Form.Group>


                                    <div className="mb-3">
                                        <h5>Our fee: 0.1 BNB</h5>
                                        <small>There is also the cost of gas and the other steps to launch the project that you must take into account. If you want more details about the fees click <Link target="_blank" to="/our-fees">here</Link></small>
                                    </div>
                                    <Button className="btn-red" type="submit">
                                        Create New Campaign
                                    </Button><br/>
                                    <small>After creating the campaign there is still a few steps before launching the campaign.</small>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
export default CampaignLauncher;
