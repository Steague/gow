import React, { PureComponent } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    InputGroup,
    FormControl,
    Button,
    Form,
    OverlayTrigger,
    Tooltip
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import Gallery from "react-photo-gallery";
import SortableGallery from "./SortableGallery";
import Photo from "./Photo";
import Player from "./Player";
import TypeTabs from "./TypeTabs";
import Loading from "./Loading";
import Empty from "./Empty";
import ScrollableViewport from "../ScrollableViewport";
import Lightbox from "./Lightbox";
import TagCloud from "../TagCloud";
import InlineInputGroup from "../InlineInputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCalendar, faTags } from "@fortawesome/pro-solid-svg-icons";
import _ from "lodash";

import "./Gallery.scss";

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
        this.getGalleryComponents = this.getGalleryComponents.bind(this);
        this.getVideoGalleryComponent = this.getVideoGalleryComponent.bind(this);
        this.getPhotoGalleryComponent = this.getPhotoGalleryComponent.bind(this);
    }

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

    getOnKeyDownConfirm(e, onConfirm) {
        switch (true) {
            case e.key === "Escape":
            case e.key === "Tab":
            case e.key === "Enter": {
                e.preventDefault();
                onConfirm();
                break;
            }
            default: {
                //
            }
        }
    }

    getGalleryComponents() {
        const { video, photos } = this.props;
        const { tab } = this.state;
        const videoComponent = this.getVideoGalleryComponent();
        const photoComponent = this.getPhotoGalleryComponent();

        return (
            <TypeTabs
                video={video}
                photos={photos}
                tab={tab}
                onSetTab={tab => this.setState({ tab })}
            >
                {videoComponent}
                {photoComponent}
                {!videoComponent && !photoComponent && <Empty />}
            </TypeTabs>
        );
    }

    getVideoGalleryComponent() {
        const { video = {} } = this.props;
        const { tab } = this.state;
        if (video.type && video.type === "video" && tab === "video") {
            return (
                <div className="gallery-images">
                    <Player url={URL.createObjectURL(video.file)} />
                </div>
            );
        }

        return null;
    }

    getPhotoGalleryComponent() {
        const {
            photos,
            axis = "xy",
            useDragHandle = false,
            onRemoveImage = () => {},
            onMakeFeaturedImage = () => {},
            onSortEnd = () => {},
            sortable = false
        } = this.props;
        const { tab } = this.state;
        if (photos.length > 0 && tab === "photos") {
            if (sortable) {
                return (
                    <ScrollableViewport
                        className="gallery-images"
                        style={{
                            width: "calc(100% + 2.5rem)",
                            height: "calc(100% + 1.25rem)"
                        }}
                    >
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
                    </ScrollableViewport>
                );
            }

            return (
                <ScrollableViewport
                    className="gallery-images"
                    style={{
                        width: "calc(100% + 2.5rem)",
                        height: "calc(100% + 1.25rem)"
                    }}
                >
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
                </ScrollableViewport>
            );
        }

        return null;
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.photos, this.props.photos)) {
            this.setState({ tab: "photos" });
            return;
        }
        if (!_.isEqual(prevProps.video, this.props.video)) {
            this.setState({ tab: "video" });
            return;
        }
    }

    render() {
        const {
            galleryName,
            galleryDescription,
            releaseDate,
            tags,
            photos = [],
            loading = true,
            className = "",
            editable = false,
            onSetGalleryState = () => {},
            onReleaseDateChange = () => {},
            tagInput = "",
            tagType = "default",
            minTags = 3
        } = this.props;

        const { viewerIsOpen, currentImage } = this.state;

        return (
            <Container className={className}>
                <Card className="text-left border border-light">
                    <Card.Header>
                        <Row>
                            <Col xs={9}>
                                {!editable && galleryName}
                                {editable && (
                                    <InlineInputGroup
                                        textId="gallery-name-text"
                                        inputId="gallery-name-input"
                                        text={
                                            <h4 id="gallery-name-text" className="mb-0">
                                                {galleryName ||
                                                    "Click to add a Gallery Title"}
                                            </h4>
                                        }
                                        input={({ onConfirm }) => (
                                            <InputGroup>
                                                <FormControl
                                                    placeholder="Title"
                                                    aria-label="Title"
                                                    aria-describedby="basic-addon1"
                                                    required
                                                    value={galleryName}
                                                    onChange={e =>
                                                        onSetGalleryState({
                                                            galleryName: e.target.value
                                                        })
                                                    }
                                                    id="gallery-name-input"
                                                    onKeyDown={e =>
                                                        this.getOnKeyDownConfirm(
                                                            e,
                                                            onConfirm
                                                        )
                                                    }
                                                    onBlur={onConfirm}
                                                />
                                                <InputGroup.Append>
                                                    <Button variant="success">
                                                        <FontAwesomeIcon
                                                            icon={faCheckCircle}
                                                            onClick={onConfirm}
                                                        />
                                                    </Button>
                                                </InputGroup.Append>
                                                <FormControl.Feedback type="invalid">
                                                    Please choose a gallery name.
                                                </FormControl.Feedback>
                                            </InputGroup>
                                        )}
                                    />
                                )}
                            </Col>
                            <Col xs={3} className="text-right">
                                {!editable && releaseDate}
                                {editable && (
                                    <InlineInputGroup
                                        tooltipPlacement="right"
                                        textId="gallery-release-date-text"
                                        inputId="gallery-release-date-input"
                                        text={
                                            <span id="gallery-release-date-text">
                                                {releaseDate instanceof Date ? (
                                                    <h4 className="mb-0">
                                                        <FontAwesomeIcon
                                                            icon={faCalendar}
                                                        />{" "}
                                                        {releaseDate.toLocaleDateString(
                                                            "en-US"
                                                        )}
                                                    </h4>
                                                ) : null}
                                            </span>
                                        }
                                        input={({ onConfirm }) => (
                                            <InputGroup>
                                                <FormControl
                                                    as={DatePicker}
                                                    selected={releaseDate}
                                                    onChange={onReleaseDateChange}
                                                    onSelect={onConfirm}
                                                    withPortal
                                                    timeFormat="HH:mm"
                                                    timeIntervals={15}
                                                    timeCaption="time"
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                    fixedHeight
                                                    className="form-control bs-date-picker"
                                                    aria-describedby="basic-addon2"
                                                    required
                                                    isValid={releaseDate instanceof Date}
                                                    id="gallery-release-date-input"
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    Please choose a gallery release date
                                                    &amp; time.
                                                </FormControl.Feedback>
                                            </InputGroup>
                                        )}
                                    />
                                )}
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text as="div" style={{ marginBottom: "1rem" }}>
                            {!editable && galleryDescription}
                            {editable && (
                                <InlineInputGroup
                                    textId="gallery-description-text"
                                    inputId="gallery-description-input"
                                    text={
                                        <span id="gallery-description-text">
                                            {galleryDescription ||
                                                "Click to add a description."}
                                        </span>
                                    }
                                    input={({ onConfirm }) => (
                                        <InputGroup>
                                            <FormControl
                                                placeholder="Description"
                                                aria-label="Description"
                                                aria-describedby="basic-addon1.1"
                                                required
                                                value={galleryDescription}
                                                onChange={e =>
                                                    onSetGalleryState({
                                                        galleryDescription: e.target.value
                                                    })
                                                }
                                                id="gallery-description-input"
                                                onKeyDown={e =>
                                                    this.getOnKeyDownConfirm(e, onConfirm)
                                                }
                                                onBlur={onConfirm}
                                            />
                                            <InputGroup.Append>
                                                <Button variant="success">
                                                    <FontAwesomeIcon
                                                        icon={faCheckCircle}
                                                        onClick={onConfirm}
                                                    />
                                                </Button>
                                            </InputGroup.Append>
                                            <FormControl.Feedback type="invalid">
                                                Please choose a gallery description.
                                            </FormControl.Feedback>
                                        </InputGroup>
                                    )}
                                />
                            )}
                        </Card.Text>
                        {loading === true && <Loading />}
                        {loading !== true && this.getGalleryComponents()}
                    </Card.Body>
                    <Card.Footer xs={3} className="badges-cloud text-right">
                        {!editable && tags}
                        {editable && (
                            <InlineInputGroup
                                tooltipPlacement="left"
                                textId="gallery-tags-text"
                                inputId="gallery-tags-input"
                                text={
                                    <div
                                        id="gallery-tags-text"
                                        className="badges-cloud text-right"
                                    >
                                        <span>
                                            <FontAwesomeIcon icon={faTags} size="sm" />{" "}
                                            <TagCloud tags={tags} />
                                        </span>
                                    </div>
                                }
                                input={({ onConfirm }) => (
                                    <InputGroup>
                                        <FormControl
                                            placeholder="Add tag"
                                            aria-label="Add tag"
                                            aria-describedby="basic-addon3"
                                            value={tagInput}
                                            onChange={e =>
                                                onSetGalleryState({
                                                    tagInput: e.target.value
                                                })
                                            }
                                            onKeyUp={e => {
                                                switch (true) {
                                                    case e.key === "Control": {
                                                        onSetGalleryState({
                                                            tagType: "default"
                                                        });
                                                        break;
                                                    }
                                                    default: {
                                                        //
                                                    }
                                                }
                                            }}
                                            onKeyDown={e => {
                                                switch (true) {
                                                    case e.key === "Control": {
                                                        onSetGalleryState({
                                                            tagType: "model"
                                                        });
                                                        break;
                                                    }
                                                    case e.key === "Escape": {
                                                        onConfirm();
                                                        break;
                                                    }
                                                    case e.key === "Tab":
                                                    case e.key === "Enter":
                                                    case e.key === ",": {
                                                        e.preventDefault();
                                                        if (tagInput.length === 0) {
                                                            onConfirm();
                                                            return;
                                                        }
                                                        if (tagInput.length < 3) {
                                                            return;
                                                        }
                                                        onSetGalleryState({
                                                            tagInput: "",
                                                            tags: [
                                                                ...tags.filter(
                                                                    ({ tag }) =>
                                                                        tag !== tagInput
                                                                ),
                                                                {
                                                                    tag: tagInput,
                                                                    type: tagType
                                                                }
                                                            ]
                                                        });
                                                        break;
                                                    }
                                                    default: {
                                                        //
                                                    }
                                                }
                                            }}
                                            isValid={tags.length > 0}
                                            isInvalid={tags.length < minTags}
                                            id="gallery-tags-input"
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="check-api-checkbox"
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip>
                                                                Use &quot;Ctrl&quot; for
                                                                interim toggle.
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Form.Check.Input
                                                            type="checkbox"
                                                            onChange={e => {
                                                                onSetGalleryState({
                                                                    tagType:
                                                                        e.target
                                                                            .checked ===
                                                                        true
                                                                            ? "model"
                                                                            : "default"
                                                                });
                                                            }}
                                                            checked={
                                                                tagType === "model"
                                                                    ? true
                                                                    : false
                                                            }
                                                        />
                                                    </OverlayTrigger>
                                                    <Form.Check.Label>
                                                        Model
                                                    </Form.Check.Label>
                                                </Form.Check>
                                            </InputGroup.Text>
                                        </InputGroup.Append>
                                        <InputGroup.Append>
                                            <Button variant="success">
                                                <FontAwesomeIcon
                                                    icon={faCheckCircle}
                                                    onClick={onConfirm}
                                                />
                                            </Button>
                                        </InputGroup.Append>
                                        <FormControl.Feedback type="invalid">
                                            {`Please add ${
                                                minTags - tags.length
                                            } more gallery tag ${
                                                minTags - tags.length === 1 ? "" : "s"
                                            } .`}
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            <div className="align-left badges-cloud">
                                                <TagCloud
                                                    tags={tags}
                                                    removeable
                                                    handleRemove={tag => {
                                                        onSetGalleryState({
                                                            tags: tags.filter(
                                                                ({ tag: storedTag }) =>
                                                                    storedTag !== tag
                                                            )
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </FormControl.Feedback>
                                    </InputGroup>
                                )}
                            />
                        )}
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
