import React, { Component } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import TagCloud from "../../TagCloud";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faCalendar } from "@fortawesome/pro-solid-svg-icons";

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
                {galleries.map(
                    (
                        {
                            uuid,
                            galleryName,
                            galleryDescription,
                            releaseDate: releaseDateString,
                            Tags: tags,
                            Assets: assets
                        },
                        i
                    ) => {
                        const releaseDate = new Date(Date.parse(releaseDateString));
                        return (
                            <NavLink
                                to={`/gallery/${uuid}`}
                                key={`gallery-link-${i}`}
                                className="text-info"
                            >
                                <Card className="text-left border-primary mb-3">
                                    <Card.Header as="h4">
                                        <Row>
                                            <Col xs={9}>{galleryName}</Col>
                                            <Col xs={3} className="text-right">
                                                {releaseDate instanceof Date ? (
                                                    <h4>
                                                        <FontAwesomeIcon
                                                            icon={faCalendar}
                                                        />{" "}
                                                        {releaseDate.toLocaleDateString(
                                                            "en-US"
                                                        )}
                                                    </h4>
                                                ) : null}
                                            </Col>
                                        </Row>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xs={9}>
                                                <strong>Description:</strong>{" "}
                                                {galleryDescription}
                                            </Col>
                                            <Col
                                                xs={3}
                                                className="badges-cloud text-right"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTags}
                                                    size="sm"
                                                />{" "}
                                                <TagCloud
                                                    tags={tags.map(({ tag }) => tag)}
                                                />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                    <Card.Img
                                        variant="top"
                                        src={`/api/v1/image/${assets[0].filename}`}
                                    />
                                </Card>
                            </NavLink>
                        );
                    }
                )}
            </Container>
        );
    }
}

export default Galleries;
