import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import TagCloud from "../../TagCloud";
import _ from "lodash";

import "./Galleries.scss";

class Galleries extends Component {
    constructor(props) {
        super(props);

        this.state = {
            galleries: []
        };

        this.getGalleries = this.getGalleries.bind(this);
        this.fittext = this.fitext.bind(this);
    }

    componentDidMount() {
        this.getGalleries();
    }

    getGalleries() {
        const { tag } = this.props.match.params;
        let uri = `/api/v1/galleries/all`;
        if (tag) {
            uri = `/api/v1/galleries/tag/${tag}`;
        }
        fetch(uri)
            .then(response => response.json())
            .then(galleries => {
                if (tag) {
                    this.setState({ galleries: galleries.Galleries });
                    return;
                }
                this.setState({ galleries });
            })
            .catch(console.error);
    }

    componentDidUpdate() {
        this.fitext();
    }

    fitext(cssClass = "fit-this-text", stagger = 1, wideable = true) {
        Array.from(document.getElementsByClassName(cssClass)).forEach(box => {
            if (
                !box.firstElementChild ||
                !/fitter/.test(box.firstElementChild.className)
            ) {
                box.innerHTML = `<div class='fitter'>${box.innerHTML}</div>`;
            }

            const FITTER = box.firstElementChild,
                CHILDREN = Array.from(box.getElementsByTagName("*")),
                overflowing = () => {
                    const BOX_PADDING_TOP = parseFloat(getComputedStyle(box).paddingTop),
                        BOX_PADDING_BOTTOM = parseFloat(
                            getComputedStyle(box).paddingBottom
                        ),
                        NORMALIZED_BOX_HEIGHT =
                            box.offsetHeight - (BOX_PADDING_TOP + BOX_PADDING_BOTTOM);
                    return Math.ceil(FITTER.offsetHeight - NORMALIZED_BOX_HEIGHT);
                },
                update_font_size = (child, reversed) =>
                    (child.style.fontSize = `${
                        parseFloat(getComputedStyle(child).fontSize) +
                        (reversed ? -stagger : stagger)
                    }px`);

            CHILDREN.forEach(child => {
                if (!child.dataset.size)
                    child.dataset.size = getComputedStyle(child).fontSize;
            });

            const execCore = () => {
                let tries = 1;
                while (
                    overflowing() < stagger * 1.5 &&
                    overflowing() !== 0 &&
                    tries <= 30
                ) {
                    tries++;
                    CHILDREN.forEach(child => {
                        if (
                            wideable ||
                            parseFloat(child.style.fontSize) + stagger <
                                parseFloat(child.dataset.size)
                        ) {
                            update_font_size(child);
                        } else {
                            child.style.removeProperty("font-size");
                        }
                    });
                }

                tries = 1;
                while (overflowing() > stagger * 1.5 && tries <= 30) {
                    tries++;
                    CHILDREN.forEach(child => update_font_size(child, true));
                }
            };

            execCore();
            window.addEventListener("resize", execCore);
        });
    }

    render() {
        const { galleries = [] } = this.state;
        return (
            <Container className="galleries">
                <Row>
                    {galleries.length >= 1 &&
                        galleries.map(
                            (
                                {
                                    uuid,
                                    galleryName,
                                    galleryDescription,
                                    assetOrder,
                                    featuredImage,
                                    releaseDate: releaseDateString,
                                    Tags: tags,
                                    Assets: assets
                                },
                                i
                            ) => {
                                const galleryFirstAsset = _.find(
                                    assets,
                                    a => a.gfsId === featuredImage
                                );
                                return (
                                    <Col
                                        xs={12}
                                        md={6}
                                        lg={4}
                                        xl={3}
                                        key={`gallery-col-${i}`}
                                        className="gallery-container"
                                    >
                                        <Card className="border border-light gallery-card">
                                            <NavLink
                                                to={`/gallery/${uuid}`}
                                                className="gallery-link text-body"
                                            >
                                                <div className="img-hover-zoom">
                                                    <Card.Img
                                                        variant="top"
                                                        src={`/api/v1/image/${galleryFirstAsset.filename}`}
                                                    />
                                                </div>
                                                <Card.Header
                                                    as="h4"
                                                    className="gallery-card-header fit-this-text"
                                                >
                                                    {galleryName}
                                                </Card.Header>
                                                <Card.Body>
                                                    <Card.Text>
                                                        {galleryDescription}
                                                    </Card.Text>
                                                </Card.Body>
                                            </NavLink>
                                            <Card.Footer className="badges-cloud align-item-start justify-content-center">
                                                <TagCloud tags={tags} />
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                );
                            }
                        )}
                </Row>
            </Container>
        );
    }
}

export default withRouter(Galleries);
