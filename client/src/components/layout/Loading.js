import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";

class LaunchNewCoin extends React.Component {
    render(){
        console.log(this.props);
        if(typeof this.props.loading != "undefined" && !this.props.loading){
            return null;
        }else if(typeof this.props.loading != "undefined" && this.props.loading){
            return (
                <div className="loading">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-6 loading-text text-center">
                                <FontAwesomeIcon icon={faCircleNotch} size="8x" spin />
                                <h1 className="mt-5">{this.props.message}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return null;
    }
}

export default LaunchNewCoin