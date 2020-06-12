import React, { Component } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ReactLoading from 'react-loading';
import Carousel, { Modal, ModalGateway } from "react-images";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/pro-solid-svg-icons';
import Gallery from "react-photo-gallery";
import SortableGallery from './SortableGallery';
import Photo from './Photo';

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
            case (loading === true): {
                return (
                    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <ReactLoading type={"cylon"} color={"#FFFFFF"} height={'20%'} width={'20%'} />
                    </div>
                );
            }
            case (photos.length > 0 && sortable): {
                return (
                    <SortableGallery
                        photos={photos}
                        useDragHandle={useDragHandle}
                        onOpenCarousel={onOpenCarousel}
                        onRemoveImage={onRemoveImage}
                        onMakeFeaturedImage={onMakeFeaturedImage}
                        onSortEnd={onSortEnd}
                        axis={axis}
                    />
                );
            }
            case (photos.length > 0 && !sortable): {
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
                    />
                );
            }
            default: {
                return (
                    <div style={{fontSize: "40px", textAlign: "center", margin: "50px 0"}}>
                        <span><FontAwesomeIcon icon={faEyeSlash} /> Empty Gallery</span>
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
                <Card className="text-left border-primary mb-3">
                    <Card.Header as="h4">
                        <Row>
                            <Col xs={9}>
                                {galleryName}
                            </Col>
                            <Col xs={3} className="text-right">
                                {releaseDate}
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col xs={9}>
                                {galleryDescription}
                            </Col>
                            <Col xs={3} className="badges-cloud text-right">
                                {tags}
                            </Col>
                        </Row>
                    </Card.Body>
                    {this.getGalleryState()}
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
