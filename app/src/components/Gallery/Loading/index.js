import React, { Component } from "react";
import ReactLoading from "react-loading";

class Loading extends Component {
    render() {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <ReactLoading
                    type={"cylon"}
                    color={"#FFFFFF"}
                    height={"20%"}
                    width={"20%"}
                />
            </div>
        );
    }
}

export default Loading;
