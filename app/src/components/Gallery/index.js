import React, { Component } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import ReactLoading from "react-loading";
import Carousel, { Modal, ModalGateway } from "react-images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash } from "@fortawesome/pro-solid-svg-icons";
import Gallery from "react-photo-gallery";
import SortableGallery from "./SortableGallery";
import Photo from "./Photo";
import { Scrollbars } from "react-custom-scrollbars";

class GowGallery extends Component {
    getGalleryState() {
        const {
            loading = true,
            sortable = false,
            photos = [],
            axis = "xy",
            useDragHandle = false,
            onOpenCarousel = () => {},
            onRemoveImage = () => {},
            onMakeFeaturedImage = () => {},
            onSortEnd = () => {}
        } = this.props;

        switch (true) {
            case loading === true: {
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
            case photos.length > 0 && sortable: {
                return (
                    <SortableGallery
                        photos={photos}
                        useDragHandle={useDragHandle}
                        onOpenCarousel={onOpenCarousel}
                        onRemoveImage={onRemoveImage}
                        onMakeFeaturedImage={onMakeFeaturedImage}
                        onSortEnd={onSortEnd}
                        axis={axis}
                        targetRowHeight={containerWidth => containerWidth / 2}
                    />
                );
            }
            case photos.length > 0 && !sortable: {
                return (
                    <Gallery
                        photos={photos}
                        renderImage={props => (
                            <Photo
                                {...props}
                                pIndex={props.index}
                                onOpenCarousel={onOpenCarousel}
                                onRemoveImage={onRemoveImage}
                                onMakeFeaturedImage={onMakeFeaturedImage}
                            />
                        )}
                        axis={axis}
                        targetRowHeight={containerWidth => containerWidth / 2}
                    />
                );
            }
            default: {
                return (
                    <div
                        style={{
                            fontSize: "40px",
                            textAlign: "center",
                            margin: "50px 0"
                        }}
                    >
                        <span>
                            <FontAwesomeIcon icon={faEyeSlash} /> Empty Gallery
                        </span>
                    </div>
                );
            }
        }
    }

    render() {
        const {
            galleryName,
            galleryDescription,
            releaseDate,
            tags,
            photos = [],
            viewerIsOpen,
            currentImage,
            closeLightbox,
            className
        } = this.props;

        return (
            <Container className={className}>
                <Card className="text-left border border-light">
                    <Card.Header as="h4">
                        <Row>
                            <Col xs={9}>{galleryName}</Col>
                            <Col xs={3} className="text-right">
                                {releaseDate}
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <div className="card-text">{galleryDescription}</div>
                        <Scrollbars
                            className="gallery-images"
                            style={{
                                width: "calc(100% + 2.5rem)",
                                height: "calc(100% + 1.2rem)"
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
                        >
                            {this.getGalleryState()}
                        </Scrollbars>
                    </Card.Body>
                    <Card.Footer xs={3} className="badges-cloud text-right">
                        {tags}
                    </Card.Footer>
                </Card>
                <ModalGateway>
                    {viewerIsOpen ? (
                        <Modal onClose={closeLightbox}>
                            <Carousel
                                currentIndex={currentImage}
                                views={photos.map(x => ({
                                    ...x,
                                    srcset: x.srcSet,
                                    caption: x.title
                                }))}
                            />
                        </Modal>
                    ) : null}
                </ModalGateway>
            </Container>
        );
    }
}

export default GowGallery;
