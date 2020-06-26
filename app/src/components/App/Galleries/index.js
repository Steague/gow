import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card, Jumbotron } from "react-bootstrap";
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
        this.fitext = this.fitext.bind(this);
        this.addBlankColumns = this.addBlankColumns.bind(this);
        this.getReleaseDateHeader = this.getReleaseDateHeader.bind(this);
    }

    componentDidMount() {
        this.getGalleries();
    }

    getGalleries() {
        window.scroll({ top: 0, left: 0, behavior: "smooth" });
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

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.match.params, this.props.match.params)) {
            this.getGalleries();
        }
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

    componentWillUpdate() {
        this.addedCols4 = 0;
    }

    getBlankCOlumnCOntent(type, width) {
        return (
            <Jumbotron className="h-100 border">
                <h1>End of the line!</h1>
                <h4>
                    You have reached the end of the galleries. Soon, this area will be
                    replaced with more fun content.
                </h4>
            </Jumbotron>
        );
    }

    addBlankColumns(i, note = "date") {
        if (i === 0 || note !== "last") return null;
        let mod4 = i % 4;
        let mod3 = i % 3;
        let mod2 = i % 2;
        console.log("fill in empty columns", note, {
            i,
            mod4,
            mod3,
            mod2
        });

        let turnOn = {
            "d-md-block": true,
            "d-lg-block": true,
            "d-xl-block": true
        };

        // switch (true) {
        //     case mod4 === 0 && mod2 === 0: {
        //         turnOn = {
        //             "d-md-none": true,
        //             "d-lg-block": true,
        //             "d-xl-none": true
        //         };
        //         break;
        //     }
        //     case mod4 === 0: {
        //         turnOn = {
        //             "d-md-block": true,
        //             "d-lg-block": true,
        //             "d-xl-none": true
        //         };
        //         break;
        //     }
        //     case mod3 === 0: {
        //         turnOn = {
        //             "d-md-block": true,
        //             "d-lg-none": true,
        //             "d-xl-block": true
        //         };
        //         break;
        //     }
        //     case mod2 === 0: {
        //         turnOn = {
        //             "d-md-none": true,
        //             "d-lg-block": true,
        //             "d-xl-block": true
        //         };
        //         break;
        //     }
        //     default: {
        //         //
        //     }
        // }

        return (
            (note === "last" || null) && (
                <Col
                    md={(2 - mod2) * 6}
                    lg={(3 - mod3) * 4}
                    xl={(4 - mod4) * 3}
                    className={`gallery-container d-xs-none d-sm-none ${_.keys(
                        turnOn
                    ).join(" ")}`}
                >
                    <Card className="border gallery-card bg-primary">
                        <Col
                            className={`mt-2 mb-2 pr-2 pl-2 d-xs-none d-sm-none d-md-none d-lg-none d-xl-block`}
                        >
                            {this.getBlankCOlumnCOntent("XL", 4 - mod4)}
                        </Col>
                        <Col
                            className={`mt-2 mb-2 pr-2 pl-2 d-xs-none d-sm-none d-md-none d-lg-block d-xl-none`}
                        >
                            {this.getBlankCOlumnCOntent("LG", 3 - mod3)}
                        </Col>
                        <Col
                            className={`mt-2 mb-2 pr-2 pl-2 d-xs-none d-sm-none d-md-block d-lg-none d-xl-none`}
                        >
                            {this.getBlankCOlumnCOntent("MD", 2 - mod2)}
                        </Col>
                    </Card>
                </Col>
            )
        );
    }

    getReleaseDateHeader(releaseDate) {
        return (
            null && (
                <Col xs={12} className="mb-4">
                    <h5 className="border bg-primary mb-0 p-1 rounded text-body">
                        {releaseDate}
                    </h5>
                </Col>
            )
        );
    }

    render() {
        const { galleries } = this.state;
        let prevReleaseDate = null;
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
                                const releaseDate = new Date(
                                    Date.parse(releaseDateString)
                                ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                });
                                let newDate = false;
                                if (releaseDate !== prevReleaseDate) {
                                    prevReleaseDate = releaseDate;
                                    newDate = true;
                                }
                                const galleryFirstAsset = _.find(
                                    assets,
                                    a => a.gfsId === featuredImage
                                );
                                return (
                                    <React.Fragment key={`gallery-col-${i}`}>
                                        {newDate && (
                                            <React.Fragment>
                                                {this.addBlankColumns(i)}
                                                {this.getReleaseDateHeader(releaseDate)}
                                            </React.Fragment>
                                        )}
                                        <Col
                                            xs={12}
                                            md={6}
                                            lg={4}
                                            xl={3}
                                            className="gallery-container"
                                        >
                                            <Card className="border gallery-card">
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
                                                        <Card.Title>
                                                            {galleryName}
                                                        </Card.Title>
                                                        <Card.Subtitle className="text-muted">
                                                            {releaseDate}
                                                        </Card.Subtitle>
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
                                        {!galleries[i + 1] &&
                                            this.addBlankColumns(i + 1, "last")}
                                    </React.Fragment>
                                );
                            }
                        )}
                </Row>
            </Container>
        );
    }
}

export default withRouter(Galleries);
