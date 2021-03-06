import React, { Component } from "react";
import _ from "lodash";
import Dropzone from "react-dropzone";
import arrayMove from "array-move";
import ifh from "../../../lib/increment-file-hash";
import { Container, Button, Navbar, Nav, Modal, ProgressBar } from "react-bootstrap";
import { confirm } from "../../ConfirmDialog";
import Gallery from "../../Gallery";
import ReactCrop from "react-image-crop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faSortCircle,
    faSortCircleUp,
    faSortCircleDown,
    faCloudUpload,
    faCheckCircle,
    faSparkles
} from "@fortawesome/pro-solid-svg-icons";
import { connect } from "react-redux";
import { addNotification, updateNotification, hideNotification } from "../../../actions";

import "react-datepicker/dist/react-datepicker.css";
import "react-image-crop/lib/ReactCrop.scss";

class AdGallery extends Component {
    constructor(props) {
        super(props);

        this.defaultState = {
            photos: [],
            video: {},
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

        this.state = this.defaultState;

        this.getAsset = this.getAsset.bind(this);
        this.getVideo = this.getVideo.bind(this);
        this.getImage = this.getImage.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);
        this.onSortUp = this.onSortUp.bind(this);
        this.onSortDown = this.onSortDown.bind(this);
        this.onClearGallery = this.onClearGallery.bind(this);
        this.onReleaseDateChange = this.onReleaseDateChange.bind(this);
        this.onSubmitGallery = this.onSubmitGallery.bind(this);
        this.clientSideValidateNewGallery = this.clientSideValidateNewGallery.bind(this);
        this.onMakeFeaturedImage = this.onMakeFeaturedImage.bind(this);
        this.onCropComplete = this.onCropComplete.bind(this);
        this.onCropChange = _.throttle(this.onCropChange.bind(this), 100);
        this.onSetGalleryState = this.onSetGalleryState.bind(this);

        this.minTags = 3;
        this.countUp = 0;
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
                    .then(async success => {
                        if (
                            await confirm("Gallery added successfully!", "OK", null, {
                                title: "Gallery Added",
                                proceedVariant: "success"
                            })
                        ) {
                            this.setState({ ...this.defaultState });
                        }
                    })
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
            this.setState(this.defaultState);
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

    getAsset(file, assetsBatch) {
        if (!file instanceof File)
            return Promise.reject(
                "Specified file is not an instance of the File object."
            );
        switch (true) {
            case file.type.startsWith("image/"): {
                return this.getImage(file, assetsBatch);
            }
            case file.type.startsWith("video/"): {
                return this.getVideo(file, assetsBatch);
            }
            default: {
                console.log("file type", file.type);
                return Promise.reject("Specified file is not an image.");
            }
        }
    }

    getVideo(file, assetsBatch) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve({
                    type: "video",
                    md5: await ifh(
                        file,
                        (percentage, batchObj) => {
                            const { type, file } = batchObj;
                            const {
                                id,
                                processedPercent,
                                processedFiles,
                                assetsCount
                            } = batchObj.batch;
                            const { updateNotification, hideNotification } = this.props;
                            if (type === "complete") {
                                const percentComplete = processedFiles / assetsCount;
                                if (percentComplete > processedPercent) {
                                    batchObj.processedPercent = percentComplete;

                                    const now = (percentComplete * 100).toFixed(2);
                                    updateNotification({
                                        id,
                                        header: "Adding Gallery Assets",
                                        body: (
                                            <span>
                                                Progress{" "}
                                                {`(${processedFiles}/${assetsCount})`}:{" "}
                                                <ProgressBar
                                                    striped
                                                    variant="info"
                                                    now={now}
                                                    label={`${now}%`}
                                                />
                                            </span>
                                        )
                                    });

                                    if (now === "100.00") {
                                        setTimeout(() => hideNotification(id), 3000);
                                    }
                                }
                            } else if (type === "part") {
                                console.log("percentage", percentage, file.name);
                                const now = (percentage * 100).toFixed(2);
                                updateNotification({
                                    id,
                                    header: `Adding ${file.name}`,
                                    body: (
                                        <span>
                                            {`Processing (${file.name}): `}
                                            <ProgressBar
                                                striped
                                                variant="info"
                                                now={now}
                                                label={`${now}%`}
                                            />
                                        </span>
                                    )
                                });
                            }
                        },
                        assetsBatch
                    ),
                    file
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    getImage(file, assetsBatch, boundBox = [640, 480]) {
        if (!boundBox || boundBox.length !== 2)
            return Promise.reject("Specified BBox is not valid.");
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const fr = new FileReader();
                fr.onload = event => {
                    const img = new Image();
                    img.onload = async () => {
                        const { width, height, src, ...rest } = img;
                        const scaleRatio =
                            Math.round(...boundBox) / Math.max(width, height);
                        canvas.width = width * scaleRatio;
                        canvas.height = height * scaleRatio;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve({
                            type: "photo",
                            md5: await ifh(
                                file,
                                (percentage, batchObj) => {
                                    const {
                                        id,
                                        processedPercent,
                                        processedFiles,
                                        assetsCount
                                    } = batchObj.batch;
                                    const percentComplete = processedFiles / assetsCount;
                                    if (percentComplete > processedPercent) {
                                        batchObj.processedPercent = percentComplete;

                                        const {
                                            updateNotification,
                                            hideNotification
                                        } = this.props;
                                        const now = (percentComplete * 100).toFixed(2);
                                        updateNotification({
                                            id,
                                            header: "Adding Gallery Assets",
                                            body: (
                                                <span>
                                                    Progress{" "}
                                                    {`(${processedFiles}/${assetsCount})`}
                                                    :{" "}
                                                    <ProgressBar
                                                        striped
                                                        variant="info"
                                                        now={now}
                                                        label={`${now}%`}
                                                    />
                                                </span>
                                            )
                                        });

                                        if (now === "100.00") {
                                            setTimeout(() => hideNotification(id), 3000);
                                        }
                                    }
                                },
                                assetsBatch
                            ),
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

    onDrop(assets) {
        this.setState({ loadingGallery: true });
        const pq = [];
        const assetsBatch = {
            id: Date.now(),
            processedPercent: 0,
            processedFiles: 0,
            assetsCount: assets.length
        };
        assets.forEach(a => {
            pq.push(this.getAsset(a, assetsBatch));
        });
        Promise.all(pq)
            .then(res => {
                const photos = [...this.state.photos];
                let video = { ...this.state.video };
                res.forEach(a => {
                    const { md5, type } = a;
                    switch (true) {
                        case type === "video": {
                            video = a;
                            console.log({ video });
                            break;
                        }
                        default: {
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
                                } = a;
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
                        }
                    }
                });
                this.setState(
                    {
                        video,
                        photos,
                        loadingGallery: false,
                        galleryName: this.state.galleryName
                            ? this.state.galleryName
                            : photos[0] && photos[0].file && photos[0].file.name
                            ? _.startCase(photos[0].file.name.replace(/\.[^/.]+$/, ""))
                            : video && video.file && video.file.name
                            ? _.startCase(video.file.name.replace(/\.[^/.]+$/, ""))
                            : ""
                    },
                    () => {
                        if (photos[0]) {
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
                    }
                );
            })
            .catch(console.error)
            .finally(() =>
                this.setState({
                    loadingGallery: false
                })
            );
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

    onSetGalleryState(state) {
        this.setState({ ...state });
    }

    render() {
        const {
            photos,
            video,
            sortDirection,
            galleryName,
            galleryDescription,
            releaseDate,
            tagInput,
            tags,
            loadingGallery,
            showCrop,
            featuredImage,
            croppedImage,
            tagType
        } = this.state;
        return (
            <div style={{ height: "100%" }}>
                <Container>
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
                                <Button onClick={this.onClearGallery} variant="danger">
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
                                                <FontAwesomeIcon icon={faCloudUpload} />{" "}
                                                Add Assets
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
                                <Button variant="success" onClick={this.onSubmitGallery}>
                                    <FontAwesomeIcon icon={faCheckCircle} /> Submit New
                                    Gallery
                                </Button>
                            </Nav.Item>
                        </Nav>
                    </Navbar>
                </Container>

                <Gallery
                    className="gallery preview-gallery text-left"
                    sortable
                    useDragHandle
                    editable
                    onSetGalleryState={this.onSetGalleryState}
                    onReleaseDateChange={this.onReleaseDateChange}
                    tagInput={tagInput}
                    tagType={tagType}
                    loading={loadingGallery}
                    galleryName={galleryName}
                    galleryDescription={galleryDescription}
                    releaseDate={releaseDate}
                    tags={tags}
                    minTags={this.minTags}
                    photos={photos}
                    video={video}
                    onRemoveImage={this.onRemoveImage}
                    onMakeFeaturedImage={this.onMakeFeaturedImage}
                    onSortEnd={this.onSortEnd}
                />
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
            </div>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    addNotification: notification => dispatch(addNotification(notification)),
    updateNotification: notification => dispatch(updateNotification(notification)),
    hideNotification: id => dispatch(hideNotification(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(AdGallery);
