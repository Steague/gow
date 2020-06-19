import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";

class ScrollableViewport extends Component {
    render() {
        const { children, className = "", style = {}, ...rest } = this.props;
        return (
            <Scrollbars
                className={className}
                style={{
                    width: "100%",
                    height: "100%",
                    ...style // overwrite default styles with passed ones
                }}
                renderTrackHorizontal={props => (
                    <div {...props} className="track-horizontal" />
                )}
                renderTrackVertical={props => (
                    <div {...props} className="track-vertical" />
                )}
                renderThumbHorizontal={props => (
                    <div
                        {...props}
                        className="thumb-horizontal border border-light bg-dark"
                    />
                )}
                renderThumbVertical={props => (
                    <div
                        {...props}
                        className="thumb-vertical border border-light bg-dark"
                    />
                )}
                {...rest}
            >
                {children}
            </Scrollbars>
        );
    }
}

export default ScrollableViewport;
