import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import TagCloud from "../../TagCloud";
import Gal from "../../Gallery";
import _ from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faCalendar } from "@fortawesome/pro-solid-svg-icons";

import "./Gallery.scss";

class Gallery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gallery: []
        };

        this.getGallery = this.getGallery.bind(this);
    }

    componentDidMount() {
        this.getGallery();
    }

    getGallery() {
        const { id } = this.props.match.params;
        fetch(`/api/v1/galleries/${id}`)
            .then(response => response.json())
            .then(gallery => {
                this.setState({ gallery });
            })
            .catch(console.error);
    }

    render() {
        const { gallery } = this.state;
        const {
            galleryName,
            galleryDescription,
            assetOrder = null,
            releaseDate: releaseDateString,
            Tags: tags = [],
            Assets: unorderedAssets = []
        } = gallery;
        const releaseDate = new Date(Date.parse(releaseDateString));
        const assets = !assetOrder
            ? []
            : assetOrder
                  .split(",")
                  .map(gfsId => _.find(unorderedAssets, ua => ua.gfsId === gfsId));
        return (
            <Gal
                className="gallery text-left"
                loading={false}
                galleryName={<h4 id="gallery-name-text">{galleryName}</h4>}
                galleryDescription={
                    <span id="gallery-description-text">{galleryDescription}</span>
                }
                releaseDate={
                    <span id="gallery-release-date-text">
                        {releaseDate instanceof Date ? (
                            <h4>
                                <FontAwesomeIcon icon={faCalendar} />{" "}
                                {releaseDate.toLocaleDateString("en-US")}
                            </h4>
                        ) : null}
                    </span>
                }
                tags={
                    <div id="gallery-tags-text" className="badges-cloud">
                        <span>
                            <FontAwesomeIcon icon={faTags} size="sm" />{" "}
                            <TagCloud tags={tags} />
                        </span>
                    </div>
                }
                photos={assets.map(({ filename, width, height }) => ({
                    src: `/api/v1/image/${filename}`,
                    width,
                    height
                }))}
            />
        );
    }
}

export default withRouter(Gallery);
