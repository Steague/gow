import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ReactLoading from 'react-loading';
import Carousel, { Modal, ModalGateway } from "react-images";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faCalendar, faTags } from '@fortawesome/pro-solid-svg-icons';
import Gallery from "react-photo-gallery";
import SortableGallery from './SortableGallery';
import Photo from './Photo';
import TagCloud from '../TagCloud';

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
                            />
                        )}
                        axis={axis}
                    />
                );
            }
            default: {
                return (
                    <div style={{fontSize: "40px", textAlign: "center", marginTop: "50px"}}>
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
            closeLightbox
        } = this.props;

        return (
            <Container>
                <Row>
                    <Col xs={9}>
                        <h4>{galleryName || "Preview Gallery"}</h4>
                    </Col>
                    <Col xs={3} className="align-right">
                        {releaseDate instanceof Date
                            ? <h4><FontAwesomeIcon icon={faCalendar} /> {releaseDate.toLocaleDateString("en-US")}</h4>
                            : null
                        }
                    </Col>
                </Row>
                <Row>
                    <Col xs={9}>
                        <strong>Description</strong>: {galleryDescription || "No description currently."}
                    </Col>
                    <Col xs={3} className="align-right">
                        {tags.length
                            ?
                                <div className="badges-cloud">
                                    <FontAwesomeIcon icon={faTags} size="sm" /> <TagCloud tags={tags} />
                                </div>
                            : null
                        }
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>{this.getGalleryState()}</Col>
                </Row>
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
