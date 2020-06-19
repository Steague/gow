import React, { PureComponent } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Gallery from "react-photo-gallery";
import SortableGallery from "./SortableGallery";
import Photo from "./Photo";
import Player from "./Player";
import TypeTabs from "./TypeTabs";
import Lightbox from "./Lightbox";

class GowGallery extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            currentImage: 0,
            viewerIsOpen: false,
            tab:
                this.props.match &&
                this.props.match.params &&
                this.props.match.params.type
                    ? this.props.match.params.type
                    : props.video && props.video.type
                    ? "video"
                    : props.photos.length > 0
                    ? "photos"
                    : "empty"
        };

        this.openLightbox = this.openLightbox.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
    }

    // TODO: Figure out why the gallery flickers when setting feature image crop
    // shouldComponentUpdate(nextProps, nextState) {
    //     const updateBool1 = !_.isEqual(this.props.galleryName, nextProps.galleryName);
    //     const updateBool2 = !_.isEqual(
    //         this.props.galleryDescription,
    //         nextProps.galleryDescription
    //     );
    //     const updateBool3 = !_.isEqual(this.props.releaseDate, nextProps.releaseDate);
    //     const updateBool4 = !_.isEqual(this.props.tags, nextProps.tags);
    //     const updateBool5 = !_.isEqual(this.props.photos, nextProps.photos);
    //     const updateBool6 = !_.isEqual(this.props.video, nextProps.video);
    //     const updateBool7 = !_.isEqual(this.props.axis, nextProps.axis);
    //     const updateBool8 = !_.isEqual(this.props.useDragHandle, nextProps.useDragHandle);
    //     const updateBool9 = !_.isEqual(this.props.onRemoveImage, nextProps.onRemoveImage);
    //     const updateBool10 = !_.isEqual(
    //         this.props.onMakeFeaturedImage,
    //         nextProps.onMakeFeaturedImage
    //     );
    //     const updateBool11 = !_.isEqual(this.props.onSortEnd, nextProps.onSortEnd);
    //     const updateBool12 = !_.isEqual(this.props.loading, nextProps.loading);
    //     const updateBool13 = !_.isEqual(this.props.sortable, nextProps.tags);
    //     const updateBool14 = !_.isEqual(this.props.className, nextProps.className);
    //     console.log({
    //         updateBool1,
    //         updateBool2,
    //         updateBool3,
    //         updateBool4,
    //         updateBool5,
    //         updateBool6,
    //         updateBool7,
    //         updateBool8,
    //         updateBool9,
    //         updateBool10,
    //         updateBool11,
    //         updateBool12,
    //         updateBool13,
    //         updateBool14
    //     });
    //     if (updateBool1) {
    //         console.log("GN", this.props.galleryName, nextProps.galleryName);
    //     }
    //     return (
    //         updateBool1 ||
    //         updateBool2 ||
    //         updateBool3 ||
    //         updateBool4 ||
    //         updateBool5 ||
    //         updateBool6 ||
    //         updateBool7 ||
    //         updateBool8 ||
    //         updateBool9 ||
    //         updateBool10 ||
    //         updateBool11 ||
    //         updateBool12 ||
    //         updateBool13 ||
    //         updateBool14
    //     );
    // }

    openLightbox(currentImage) {
        this.setState({
            currentImage,
            viewerIsOpen: true
        });
    }

    closeLightbox() {
        this.setState({
            currentImage: 0,
            viewerIsOpen: false
        });
    }

    render() {
        const {
            galleryName,
            galleryDescription,
            releaseDate,
            tags,
            photos = [],
            video = {},
            axis = "xy",
            useDragHandle = false,
            onRemoveImage = () => {},
            onMakeFeaturedImage = () => {},
            onSortEnd = () => {},
            loading = true,
            sortable = false,
            className = ""
        } = this.props;

        const { viewerIsOpen, currentImage } = this.state;

        const videoTab =
            video.type && video.type === "video"
                ? props => <Player url={URL.createObjectURL(video.file)} />
                : null;
        const photosTab =
            photos.length > 0
                ? sortable
                    ? props => (
                          <SortableGallery
                              photos={photos}
                              useDragHandle={useDragHandle}
                              onOpenCarousel={this.openLightbox}
                              onRemoveImage={onRemoveImage}
                              onMakeFeaturedImage={onMakeFeaturedImage}
                              onSortEnd={onSortEnd}
                              axis={axis}
                              targetRowHeight={containerWidth => containerWidth / 2}
                          />
                      )
                    : props => (
                          <Gallery
                              photos={photos}
                              renderImage={props => (
                                  <Photo
                                      {...props}
                                      pIndex={props.index}
                                      onOpenCarousel={this.openLightbox}
                                      onRemoveImage={onRemoveImage}
                                      onMakeFeaturedImage={onMakeFeaturedImage}
                                  />
                              )}
                              axis={axis}
                              targetRowHeight={containerWidth => containerWidth / 2}
                          />
                      )
                : null;

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
                        <Card.Text as="div" style={{ marginBottom: "1rem" }}>
                            {galleryDescription}
                        </Card.Text>
                        <TypeTabs
                            loading={loading}
                            videoTab={videoTab}
                            photosTab={photosTab}
                        />
                    </Card.Body>
                    <Card.Footer xs={3} className="badges-cloud text-right">
                        {tags}
                    </Card.Footer>
                </Card>
                <Lightbox
                    viewerIsOpen={viewerIsOpen}
                    closeLightbox={this.closeLightbox}
                    currentImage={currentImage}
                    photos={photos}
                />
            </Container>
        );
    }
}

export default GowGallery;
