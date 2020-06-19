import React, { Component } from "react";
import { Nav } from "react-bootstrap";
import Empty from "../Empty";
import Loading from "../Loading";
import ScrollableViewport from "../../ScrollableViewport";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPortrait, faVideo } from "@fortawesome/pro-solid-svg-icons";
import _ from "lodash";

class TypeTabs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: null
        };

        this.getAvailableTabs = this.getAvailableTabs.bind(this);
        this.setUnsetTabs = this.setUnsetTab.bind(this);
    }

    getAvailableTabs() {
        const { videoTab, photosTab } = this.props;
        const availableTabs = {};
        if (typeof videoTab === "function") {
            availableTabs["video"] = true;
        }
        if (typeof photosTab === "function") {
            availableTabs["photos"] = true;
        }
        return availableTabs;
    }

    setUnsetTab() {
        const { tab } = this.state;
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
        const { loading = false, videoTab: VideoTab, photosTab: PhotosTab } = this.props;
        const { tab } = this.state;
        const availableTabs = this.getAvailableTabs();
        return (
            <React.Fragment>
                {availableTabs["video"] && availableTabs["photos"] && (
                    <Nav
                        justify
                        variant="tabs"
                        activeKey={tab}
                        onSelect={tab => this.setState({ tab })}
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
                {loading === true && <Loading />}
                {loading === false &&
                    ((tab === "video" && availableTabs["video"]) ||
                        (availableTabs["video"] && !availableTabs["photos"])) && (
                        <div className="gallery-images">
                            <VideoTab />
                        </div>
                    )}
                {loading === false &&
                    ((tab === "photos" && availableTabs["photos"]) ||
                        (availableTabs["photos"] && !availableTabs["video"])) && (
                        <ScrollableViewport
                            className="gallery-images"
                            style={{
                                width: "calc(100% + 2.5rem)",
                                height: "calc(100% + 1.2rem)"
                            }}
                        >
                            <PhotosTab />
                        </ScrollableViewport>
                    )}
                {loading === false && _.keys(availableTabs).length === 0 && <Empty />}
            </React.Fragment>
        );
    }
}

export default TypeTabs;
