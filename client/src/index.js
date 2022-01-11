import React from 'react';
import ReactDOM from 'react-dom';

import 'react-toastify/dist/ReactToastify.min.css';
import './index.scss';
//import * as serviceWorker from './serviceWorker';


import {Route, Routes, BrowserRouter, useParams} from 'react-router-dom';

/**
 * Drizzle Config
 */
import {Drizzle, EventActions, generateStore} from "@drizzle/store";

import LowFee from "./contracts/LowFee.json";
import LowFeeAssets from "./contracts/LowFeeAssets.json";
import { toast } from 'react-toastify'
import Loading from "./components/layout/Loading";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Dashboard from "./routes/app/Dashboard";
import LaunchNewCoin from "./routes/app/LaunchNewCoin";
import Welcome from "./routes/app/Welcome";
import GetFunded from "./routes/app/GetFunded";
import CampaignLauncher from "./routes/app/campaign/CampaignLauncher";
import MyTokens from "./routes/app/MyTokens";
import MyCampaigns from "./routes/app/MyCampaigns";
import ManageCampaign from "./routes/app/ManageCampaign";
import CampaignSetupVesting from "./routes/app/campaign/CampaignSetupVesting";
import CampaignSubmitTokens from "./routes/app/campaign/CampaignSubmitTokens";
import CampaignReview from "./routes/app/campaign/CampaignReview";
import CampaignBuy from "./routes/app/campaign/CampaignBuy";
import MyAssets from "./routes/app/MyAssets";
import Fees from "./routes/app/Fees";
import FundAnIdea from "./routes/app/FundAnIdea";

const options = {
    contracts: [LowFee, LowFeeAssets],
    web3: {
        fallback: {
            type: "ws",
            url: "ws://127.0.0.1:7545",
        },
    }
};

global.env = {entityWallet: '0x74fDA6B5e26ccC53f50a5cb841c877A875B8B570'}

const contractEventNotifier = store => next => action => {
    if (action.type === EventActions.EVENT_FIRED) {
        const contract = action.name
        const contractEvent = action.event.event
        const message = action.event.returnValues._message
        const display = `${contract}(${contractEvent}): ${message}`

        toast.success(display, { position: toast.POSITION.TOP_RIGHT })
    }
    return next(action)
}
const appMiddlewares = [contractEventNotifier];

// setup the drizzle store and drizzle
const drizzle = new Drizzle(options, generateStore({
    options,
    appMiddlewares,
    disableReduxDevTools: false  // enable ReduxDevTools!
}));

window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload()
})

const Routing = (drizzle, drizzleState) => {
    return(
        <div className="App">
            <BrowserRouter>
                <Header defaultAddress={drizzleState.accounts[0]}/>
                <Routes>
                    <Route path="/" element={<Welcome drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/dashboard" element={<Dashboard drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/get-funded" element={<GetFunded drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/fund-an-idea" element={<FundAnIdea drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/our-fees" element={<Fees drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/token/new" element={<LaunchNewCoin drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/token/my" element={<MyTokens drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/campaign/launch" element={<CampaignLauncher drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/campaign/my" element={<MyCampaigns drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/campaign/:address" element={<ManageCampaign drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/campaign/:address/vesting" element={<CampaignSetupVesting drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/campaign/:address/submitTokens" element={<CampaignSubmitTokens drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/campaign/:address/review" element={<CampaignReview drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/campaign/:address/buy" element={<CampaignBuy drizzle={drizzle} drizzleState={drizzleState} />}/>
                    <Route path="/my/assets" element={<MyAssets drizzle={drizzle} drizzleState={drizzleState} />}/>
                </Routes>
                <Footer/>
            </BrowserRouter>
        </div>
    )
}

console.log(drizzle)
drizzle.store.subscribe(() => {
    const drizzleState = drizzle.store.getState();

    if (drizzleState.drizzleStatus.initialized) {
        ReactDOM.render(
            Routing(drizzle, drizzleState),
            document.getElementById("root")
        );
    }
});

const FirstLoading = () => {
    return(
        <Loading loading={true} message={"Welcome to LowFee, please connect your wallet!"}/>
    )
}

ReactDOM.render(
    FirstLoading(),
    document.getElementById("root")
);