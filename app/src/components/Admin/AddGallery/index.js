import React, { Component } from "react";
import _ from "lodash";
import Dropzone from "react-dropzone";
import arrayMove from "array-move";
import CryptoJS from "crypto-js";
import {
    Container,
    Row,
    Col,
    Button,
    Form,
    InputGroup,
    FormControl,
    Navbar,
    Nav,
    Modal,
    OverlayTrigger,
    Tooltip
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { confirm } from "../../ConfirmDialog";
import TagCloud from "../../TagCloud";
import Gallery from "../../Gallery";
import ReactCrop from "react-image-crop";

import InlineInputGroup from "../../InlineInputGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faSortCircle,
    faSortCircleUp,
    faSortCircleDown,
    faCloudUpload,
    faCalendar,
    faTags,
    faCheckCircle,
    faSparkles
} from "@fortawesome/pro-solid-svg-icons";

import "react-datepicker/dist/react-datepicker.css";
import "react-image-crop/lib/ReactCrop.scss";

class AdGallery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            photos: [],
            currentImage: 0,
            viewerIsOpen: false,
            sortDirection: "Up",
            galleryName: "",
            galleryDescription: "",
            releaseDate: new Date(),
            tagInput: "",
            tags: [],
            loadingGallery: false,
            featuredImage: 0,
            crop: {
                unit: "%",
                width: 100,
                aspect: 1 / 1
            },
            showCrop: false,
            croppedImage: null,
            croppedImageCanvas: null,
            tagType: "default"
        };

        this.getImage = this.getImage.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);
        this.onSortTagsEnd = this.onSortTagsEnd.bind(this);
        this.onSortUp = this.onSortUp.bind(this);
        this.onSortDown = this.onSortDown.bind(this);
        this.onClearGallery = this.onClearGallery.bind(this);
        this.onReleaseDateChange = this.onReleaseDateChange.bind(this);
        this.onSubmitGallery = this.onSubmitGallery.bind(this);
        this.clientSideValidateNewGallery = this.clientSideValidateNewGallery.bind(this);
        this.onMakeFeaturedImage = this.onMakeFeaturedImage.bind(this);
        this.onCropComplete = this.onCropComplete.bind(this);
        this.onCropChange = this.onCropChange.bind(this);

        this.minTags = 3;
    }

    onCropComplete(crop, percentCrop) {
        this.makeClientCrop(percentCrop);
    }

    onCropChange(crop, percentCrop) {
        this.setState({ crop: percentCrop });
    }

    async makeClientCrop(crop) {
        if (crop.width && crop.height) {
            const croppedImage = await this.getCroppedImg(crop);
            this.setState({ croppedImage });
        }
    }

    getCroppedImg(crop) {
        return new Promise((resolve, reject) => {
            try {
                const image = this.state.photos[this.state.featuredImage];
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const fr = new FileReader();
                fr.onload = event => {
                    const img = new Image();
                    img.onload = () => {
                        canvas.width = image.originalWidth * (crop.width * 0.01);
                        canvas.height = image.originalHeight * (crop.height * 0.01);
                        ctx.drawImage(
                            img,
                            image.originalWidth * (crop.x * 0.01),
                            image.originalHeight * (crop.y * 0.01),
                            image.originalWidth * (crop.width * 0.01),
                            image.originalHeight * (crop.height * 0.01),
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );
                        this.setState(
                            {
                                croppedImageCanvas: canvas
                            },
                            () => resolve(canvas.toDataURL())
                        );
                    };

                    img.src = fr.result; // is the data URL because called with readAsDataURL
                };
                fr.readAsDataURL(image.file);
            } catch (e) {
                reject(e);
            }
        });
    }

    async onMakeFeaturedImage(pIndex) {
        this.setState({ showCrop: true, featuredImage: pIndex });
    }

    clientSideValidateNewGallery(e) {
        console.log(e);
        return true;
    }

    async onSubmitGallery(e) {
        e.preventDefault();
        if (!this.clientSideValidateNewGallery(e)) return;
        if (
            await confirm("Are your sure?", "Proceed", "Cancel", {
                title: "Confirm galley submission",
                proceedVariant: "success"
            })
        ) {
            console.log("submit gallery");
            const { token } = this.props;
            const {
                photos,
                galleryName,
                galleryDescription,
                releaseDate,
                tags,
                featuredImage,
                crop,
                croppedImageCanvas
            } = this.state;
            const upload = async () => {
                const data = new FormData();
                photos.forEach(
                    (
                        {
                            file,
                            originalWidth: width,
                            originalHeight: height,
                            scaleRatio,
                            md5
                        },
                        i
                    ) => {
                        data.append(
                            `metadata[]`,
                            JSON.stringify({
                                width,
                                height,
                                scaleRatio,
                                md5,
                                fieldname: `file-${i}`
                            })
                        );
                        data.append(`file-${i}`, file);
                    }
                );
                data.append("galleryName", galleryName);
                data.append("galleryDescription", galleryDescription);
                data.append("releaseDate", releaseDate);
                data.append(
                    "featuredImage",
                    JSON.stringify({
                        featuredImage,
                        crop,
                        croppedImage: "croppedImage" // name of the form param
                    })
                );
                data.append(
                    `metadata[]`,
                    JSON.stringify({
                        width: parseInt(
                            photos[featuredImage].originalWidth * (crop.width * 0.01)
                        ),
                        height: parseInt(
                            photos[featuredImage].originalHeight * (crop.height * 0.01)
                        ),
                        fieldname: "croppedImage"
                    })
                );
                const croppedImageBlob = () =>
                    new Promise((resolve, reject) => {
                        try {
                            croppedImageCanvas.toBlob(
                                blob => resolve(blob),
                                "image/jpeg",
                                0.95
                            );
                        } catch (e) {
                            reject(e);
                        }
                    });
                try {
                    data.append(`croppedImage`, await croppedImageBlob(), "cropped.jpg");
                } catch (e) {
                    console.error(e);
                }
                tags.forEach(tag => {
                    data.append("tags[]", JSON.stringify(tag));
                });
                const myHeaders = new Headers({
                    Authorization: `Bearer ${token}`
                });
                const options = {
                    method: "POST",
                    mode: "cors",
                    cache: "default",
                    headers: myHeaders,
                    body: data
                };
                fetch("/api/v1/upload", options)
                    .then(
                        response => response.json() // if the response is a JSON object
                    )
                    .then(
                        success => console.log(success) // Handle the success response object
                    )
                    .catch(console.error);
            };
            upload();
        }
    }

    onReleaseDateChange(releaseDate) {
        this.setState({ releaseDate });
    }

    async onClearGallery(e) {
        e.preventDefault();
        if (
            await confirm("Are your sure?", "Proceed", "Cancel", {
                title: "Confirm clear",
                proceedVariant: "danger"
            })
        ) {
            this.setState({
                photos: [],
                currentImage: 0,
                viewerIsOpen: false,
                sortDirection: "Up"
            });
        }
    }

    onSortUp(e) {
        e.preventDefault();
        this.setState({
            photos: _.orderBy(this.state.photos, ["file.name"]),
            sortDirection: "Up"
        });
    }

    onSortDown(e) {
        e.preventDefault();
        this.setState({
            photos: _.orderBy(this.state.photos, ["file.name"], ["desc"]),
            sortDirection: "Down"
        });
    }

    onSortTagsEnd({ oldIndex, newIndex }) {
        this.setState({
            tags: arrayMove(this.state.tags, oldIndex, newIndex)
        });
    }

    onSortEnd({ oldIndex, newIndex }) {
        this.setState({
            photos: arrayMove(this.state.photos, oldIndex, newIndex),
            sortDirection: ""
        });
    }

    onRemoveImage(pIndex) {
        this.setState({
            photos: _.remove(this.state.photos, (p, i) => i !== pIndex)
        });
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

    getImage(file, boundBox = [640, 480]) {
        if (!file instanceof File)
            return Promise.reject(
                "Specified file is not an instance of the File object."
            );
        if (!file.type.startsWith("image/"))
            return Promise.reject("Specified file is not an image.");
        if (!boundBox || boundBox.length !== 2)
            return Promise.reject("Specified BBox is not valid.");
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const fr = new FileReader();
                fr.onload = event => {
                    const img = new Image();
                    img.onload = () => {
                        const { width, height, src, ...rest } = img;
                        const scaleRatio =
                            Math.round(...boundBox) / Math.max(width, height);
                        canvas.width = width * scaleRatio;
                        canvas.height = height * scaleRatio;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve({
                            md5: CryptoJS.MD5(src).toString(),
                            width,
                            height,
                            originalWidth: width,
                            originalHeight: height,
                            scaleRatio,
                            src,
                            canvas,
                            file,
                            ...rest
                        });
                    };

                    img.src = fr.result; // is the data URL because called with readAsDataURL
                };
                fr.readAsDataURL(file);
            } catch (e) {
                reject(e);
            }
        });
    }

    onDrop(uPictures) {
        this.setState({ loadingGallery: true });
        const pq = [];
        uPictures.forEach(p => {
            pq.push(this.getImage(p));
        });
        Promise.all(pq)
            .then(res => {
                const photos = [...this.state.photos];
                res.forEach(p => {
                    const { md5 } = p;
                    // Make sure we dont already have the image
                    if (_.findIndex(photos, { md5 }) === -1) {
                        const {
                            width,
                            height,
                            originalWidth,
                            originalHeight,
                            scaleRatio,
                            src,
                            canvas,
                            file
                        } = p;
                        photos.push({
                            src,
                            canvas,
                            width,
                            height,
                            originalWidth,
                            originalHeight,
                            scaleRatio,
                            file,
                            md5
                        });
                    }
                });
                this.setState(
                    {
                        photos,
                        loadingGallery: false,
                        galleryName: this.state.galleryName
                            ? this.state.galleryName
                            : photos[0] && photos[0].file && photos[0].file.name
                            ? _.startCase(photos[0].file.name.replace(/\.[^/.]+$/, ""))
                            : ""
                    },
                    () => {
                        const photo = photos[0];
                        const max = Math.max(photo.width, photo.height);
                        const [width, height] = [
                            (photo.height / max) * 100,
                            (photo.width / max) * 100
                        ];
                        this.makeClientCrop({
                            width,
                            height,
                            x: 0,
                            y: 0,
                            aspect: 1
                        });
                    }
                );
            })
            .catch(console.error);
    }

    getOnKeyDownConfirm(e, onConfirm) {
        switch (true) {
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

    render() {
        const {
            photos,
            currentImage,
            viewerIsOpen,
            sortDirection,
            galleryName,
            galleryDescription,
            releaseDate,
            tagInput,
            tags,
            loadingGallery,
            showCrop,
            featuredImage,
            croppedImage
        } = this.state;
        return (
            <Container>
                <Row>
                    <Col>
                        <Navbar
                            className="navbar-light"
                            style={{
                                padding: "5px 0 0 0",
                                border: "1px solid white",
                                margin: "10px 0",
                                borderRadius: "10px"
                            }}
                        >
                            <Nav
                                className="mr-auto"
                                style={{
                                    padding: "0 0 0 5px"
                                }}
                            >
                                <Nav.Item
                                    style={{
                                        padding: "0 5px 0 0"
                                    }}
                                >
                                    <Button
                                        onClick={this.onClearGallery}
                                        variant="danger"
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> Clear Gallery
                                    </Button>
                                </Nav.Item>
                                <Nav.Item
                                    style={{
                                        padding: "0 5px 0 0"
                                    }}
                                >
                                    <Button
                                        variant="info"
                                        onClick={
                                            sortDirection !== "Up"
                                                ? this.onSortUp
                                                : this.onSortDown
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                sortDirection === "Up"
                                                    ? faSortCircleUp
                                                    : sortDirection === "Down"
                                                    ? faSortCircleDown
                                                    : faSortCircle
                                            }
                                        />{" "}
                                        Sorted:{" "}
                                        {sortDirection === "Up"
                                            ? "Ascending"
                                            : sortDirection === "Down"
                                            ? "Descending"
                                            : "Unsorted"}
                                    </Button>
                                </Nav.Item>
                                <Nav.Item
                                    style={{
                                        padding: "0 5px 0 0"
                                    }}
                                >
                                    <Dropzone onDrop={this.onDrop}>
                                        {({ getRootProps, getInputProps }) => (
                                            <div {...getRootProps()}>
                                                <Button variant="info">
                                                    <FontAwesomeIcon
                                                        icon={faCloudUpload}
                                                    />{" "}
                                                    Add images
                                                </Button>
                                                <input {...getInputProps()} />
                                            </div>
                                        )}
                                    </Dropzone>
                                </Nav.Item>
                                {croppedImage && (
                                    <Nav.Item
                                        style={{
                                            padding: "0 5px 0 0"
                                        }}
                                    >
                                        <Button
                                            variant="info"
                                            onClick={async () => {
                                                if (
                                                    await confirm(
                                                        <img
                                                            alt="Crop"
                                                            style={{
                                                                maxWidth: "100%"
                                                            }}
                                                            src={croppedImage}
                                                        />,
                                                        "OK",
                                                        null,
                                                        {
                                                            title: "Featured Image",
                                                            proceedVariant: "success"
                                                        }
                                                    )
                                                ) {
                                                    // magic
                                                }
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faSparkles} /> Featured
                                            Image
                                        </Button>
                                    </Nav.Item>
                                )}
                            </Nav>
                            <Nav
                                style={{
                                    padding: "0 5px 0 0"
                                }}
                            >
                                <Nav.Item>
                                    <Button
                                        variant="success"
                                        onClick={this.onSubmitGallery}
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} /> Submit
                                        New Gallery
                                    </Button>
                                </Nav.Item>
                            </Nav>
                        </Navbar>
                        <div className="preview-gallery">
                            <Gallery
                                sortable
                                useDragHandle
                                loading={loadingGallery}
                                galleryName={
                                    <InlineInputGroup
                                        textId="gallery-name-text"
                                        inputId="gallery-name-input"
                                        text={
                                            <h4 id="gallery-name-text">
                                                {galleryName || "Gallery Title"}
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
                                                    onChange={e => {
                                                        this.setState({
                                                            galleryName: e.target.value
                                                        });
                                                    }}
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
                                }
                                galleryDescription={
                                    <InlineInputGroup
                                        textId="gallery-description-text"
                                        inputId="gallery-description-input"
                                        text={
                                            <span id="gallery-description-text">
                                                {galleryDescription ||
                                                    "No description currently."}
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
                                                    onChange={e => {
                                                        this.setState({
                                                            galleryDescription:
                                                                e.target.value
                                                        });
                                                    }}
                                                    id="gallery-description-input"
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
                                                    Please choose a gallery description.
                                                </FormControl.Feedback>
                                            </InputGroup>
                                        )}
                                    />
                                }
                                releaseDate={
                                    <InlineInputGroup
                                        tooltipPlacement="right"
                                        textId="gallery-release-date-text"
                                        inputId="gallery-release-date-input"
                                        text={
                                            <span id="gallery-release-date-text">
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
                                            </span>
                                        }
                                        input={({ onConfirm }) => (
                                            <InputGroup>
                                                <FormControl
                                                    as={DatePicker}
                                                    selected={releaseDate}
                                                    onChange={this.onReleaseDateChange}
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
                                }
                                tags={
                                    <InlineInputGroup
                                        tooltipPlacement="right"
                                        textId="gallery-tags-text"
                                        inputId="gallery-tags-input"
                                        text={
                                            <div
                                                id="gallery-tags-text"
                                                className="badges-cloud text-right"
                                            >
                                                <span>
                                                    <FontAwesomeIcon
                                                        icon={faTags}
                                                        size="sm"
                                                    />{" "}
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
                                                    onChange={e => {
                                                        this.setState({
                                                            tagInput: e.target.value
                                                        });
                                                    }}
                                                    onKeyUp={e => {
                                                        switch (true) {
                                                            case e.key === "Control": {
                                                                this.setState({
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
                                                                this.setState({
                                                                    tagType: "model"
                                                                });
                                                                break;
                                                            }
                                                            case e.key === "Tab":
                                                            case e.key === "Enter":
                                                            case e.key === ",": {
                                                                e.preventDefault();
                                                                if (
                                                                    tagInput.length === 0
                                                                ) {
                                                                    onConfirm();
                                                                    return;
                                                                }
                                                                if (tagInput.length < 3) {
                                                                    return;
                                                                }
                                                                const {
                                                                    tagType
                                                                } = this.state;
                                                                this.setState({
                                                                    tagInput: "",
                                                                    tags: [
                                                                        ...tags.filter(
                                                                            ({ tag }) =>
                                                                                tag !==
                                                                                tagInput
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
                                                    isInvalid={tags.length < this.minTags}
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
                                                                        Use
                                                                        &quot;Ctrl&quot;
                                                                        for interim
                                                                        toggle.
                                                                    </Tooltip>
                                                                }
                                                            >
                                                                <Form.Check.Input
                                                                    type="checkbox"
                                                                    onChange={e => {
                                                                        this.setState({
                                                                            tagType:
                                                                                e.target
                                                                                    .checked ===
                                                                                true
                                                                                    ? "model"
                                                                                    : "default"
                                                                        });
                                                                    }}
                                                                    checked={
                                                                        this.state
                                                                            .tagType ===
                                                                        "model"
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
                                                        this.minTags - tags.length
                                                    } more gallery tag ${
                                                        this.minTags - tags.length === 1
                                                            ? ""
                                                            : "s"
                                                    } .`}
                                                </FormControl.Feedback>
                                                <FormControl.Feedback type="valid">
                                                    <div className="align-left badges-cloud">
                                                        <TagCloud
                                                            tags={tags}
                                                            removeable
                                                            handleRemove={i => {
                                                                this.setState({
                                                                    tags: tags.filter(
                                                                        (t, index) =>
                                                                            index !== i
                                                                    )
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl.Feedback>
                                            </InputGroup>
                                        )}
                                    />
                                }
                                photos={photos}
                                onOpenCarousel={this.openLightbox}
                                closeLightbox={this.closeLightbox}
                                onRemoveImage={this.onRemoveImage}
                                onMakeFeaturedImage={this.onMakeFeaturedImage}
                                onSortEnd={this.onSortEnd}
                                viewerIsOpen={viewerIsOpen}
                                currentImage={currentImage}
                            />
                        </div>
                    </Col>
                </Row>
                {/*{photos[0] && (
                    <ReactCrop
                        src={photos[0].src}
                        crop={this.state.crop}
                        ruleOfThirds
                        onChange={crop => {
                            this.setState({ crop });
                        }}
                      />
                )}*/}
                <Modal show={showCrop} backdrop="static" keyboard={false}>
                    <Modal.Header>
                        <Modal.Title>Crop Featured Image</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {photos[0] && (
                            <ReactCrop
                                src={photos[featuredImage].src}
                                crop={this.state.crop}
                                ruleOfThirds
                                onComplete={this.onCropComplete}
                                onChange={this.onCropChange}
                            />
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="success"
                            onClick={() => this.setState({ showCrop: false })}
                        >
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

export default AdGallery;
