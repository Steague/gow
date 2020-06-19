import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash } from "@fortawesome/pro-solid-svg-icons";

class Empty extends Component {
    render() {
        return (
            <div
                style={{
                    fontSize: "40px",
                    textAlign: "center",
                    margin: "50px 0"
                }}
            >
                <span>
                    <FontAwesomeIcon icon={faEyeSlash} /> Empty Gallery
                </span>
            </div>
        );
    }
}

export default Empty;
