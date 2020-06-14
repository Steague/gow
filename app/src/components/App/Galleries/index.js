import React, { Component } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import TagCloud from "../../TagCloud";
import _ from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/pro-solid-svg-icons";

import "./Galleries.scss";

class Galleries extends Component {
    constructor(props) {
        super(props);

        this.state = {
            galleries: []
        };

        this.getGalleries = this.getGalleries.bind(this);
    }

    componentDidMount() {
        this.getGalleries();
    }

    getGalleries() {
        fetch("/api/v1/galleries/all")
            .then(response => response.json())
            .then(galleries => {
                this.setState({ galleries });
            })
            .catch(console.error);
    }

    render() {
        const { galleries } = this.state;
        return (
            <Container className="galleries">
                <Row>
                    {galleries.map(
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
                            const releaseDate = new Date(Date.parse(releaseDateString));
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
                                >
                                    <NavLink
                                        to={`/gallery/${uuid}`}
                                        className="text-info"
                                    >
                                        <Card className="text-left border-primary mb-3">
                                            <Card.Img
                                                variant="top"
                                                src={`/api/v1/image/${galleryFirstAsset.filename}`}
                                            />
                                            <Card.Header as="span" className="gallery-card-header">
                                                <Row className="gallery-card-header-row">
                                                    <Col xs={6}>{galleryName}</Col>
                                                    <Col xs={6} className="text-right">
                                                        {releaseDate instanceof Date ? (
                                                            <span>
                                                                <FontAwesomeIcon
                                                                    icon={faCalendar}
                                                                />{" "}
                                                                {releaseDate.toLocaleDateString(
                                                                    "en-US"
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col xs={12} lg={7}>
                                                        {galleryDescription}
                                                    </Col>
                                                    <Col
                                                         xs={12} lg={5}
                                                        className="badges-cloud text-right"
                                                    >
                                                        <TagCloud
                                                            tags={tags.map(({ tag }) => tag)}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </NavLink>
                                </Col>
                            );
                        }
                    )}
                </Row>>
            </Container>
        );
    }
}

export default Galleries;
