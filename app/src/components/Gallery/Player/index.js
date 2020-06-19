import React, { Component } from "react";
import ReactPlayer from "react-player";

class Player extends Component {
    render() {
        const { url } = this.props;
        return <ReactPlayer url={url} width="100%" height="100%" controls />;
    }
}

export default Player;
