import React, { Component } from "react";
import { Nav } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPortrait, faVideo } from "@fortawesome/pro-solid-svg-icons";

class TypeTabs extends Component {
    constructor(props) {
        super(props);

        this.getAvailableTabs = this.getAvailableTabs.bind(this);
        this.setUnsetTabs = this.setUnsetTab.bind(this);
    }

    getAvailableTabs() {
        const { video, photos } = this.props;
        const availableTabs = {};
        if (video && video.type === "video") {
            availableTabs["video"] = true;
        }
        if (photos && photos.length > 0) {
            availableTabs["photos"] = true;
        }
        return availableTabs;
    }

    setUnsetTab() {
        const { tab } = this.props;
        if (tab) return;

        const availableTabs = this.getAvailableTabs();
        if (availableTabs["video"] && !availableTabs["photos"]) {
            this.setState({ tab: "video" });
        } else if (availableTabs["photos"] && !availableTabs["video"]) {
            this.setState({ tab: "photos" });
        } else {
            this.setState({ tab: "video" });
        }
    }

    componentDidUpdate() {
        this.setUnsetTab();
    }

    render() {
        const { tab, onSetTab = () => {} } = this.props;
        const availableTabs = this.getAvailableTabs();
        return (
            <React.Fragment>
                {availableTabs["video"] && availableTabs["photos"] && (
                    <Nav
                        justify
                        variant="tabs"
                        activeKey={tab}
                        onSelect={onSetTab}
                        className="mb-1"
                    >
                        <Nav.Item>
                            <Nav.Link eventKey="video">
                                <FontAwesomeIcon icon={faVideo} className="mr-1" />
                                Video
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="photos">
                                <FontAwesomeIcon icon={faPortrait} className="mr-1" />
                                Photos
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                )}
                {this.props.children}
            </React.Fragment>
        );
    }
}

export default TypeTabs;
