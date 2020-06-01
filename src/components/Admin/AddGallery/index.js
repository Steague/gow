import React, { Component } from 'react';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import arrayMove from "array-move";
import CryptoJS from "crypto-js";
import { Container, Row, Col, Button, InputGroup, FormControl, Navbar, Nav } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { confirm } from '../../ConfirmDialog';
import TagCloud from '../../TagCloud';
import Gallery from '../../Gallery';

import InlineInputGroup from '../../InlineInputGroup';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSortCircle, faSortCircleUp, faSortCircleDown, faCloudUpload, faCalendar, faTags, faCheckCircle } from '@fortawesome/pro-solid-svg-icons';

import "react-datepicker/dist/react-datepicker.css";

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
            loadingGallery: false
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
        this.cliuentSideValidateNewGallery = this.cliuentSideValidateNewGallery.bind(this);

        this.minTags = 3;
    }

    cliuentSideValidateNewGallery(e) {
        console.log(e);
        return true;
    }

    async onSubmitGallery(e) {
        e.preventDefault();
        if (!this.cliuentSideValidateNewGallery()) return;
        if (await confirm("Are your sure?", "Proceed", "Cancel", {title: "Confirm galley submission", proceedVariant: "success"})) {
            console.log("submit gallery");
        }
    }

    onReleaseDateChange(releaseDate) {
        this.setState({releaseDate});
    }

    async onClearGallery(e) {
        e.preventDefault();
        if (await confirm("Are your sure?", "Proceed", "Cancel", {title: "Confirm clear", proceedVariant: "danger"})) {
            this.setState({ photos: [], currentImage: 0, viewerIsOpen: false, sortDirection: "Up" });
        }
    }

    onSortUp(e) {
        e.preventDefault();
        this.setState({
            photos: _.orderBy(this.state.photos, ['file.name']),
            sortDirection: "Up"
        });
    }

    onSortDown(e) {
        e.preventDefault();
        this.setState({
            photos: _.orderBy(this.state.photos, ['file.name'], ['desc']),
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
        this.setState({photos: _.remove(this.state.photos, (p,i) => i !== pIndex)});
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
    };


    getImage(file, boundBox = [640, 480]) {
        if (!file instanceof File) return Promise.reject("Specified file is not an instance of the File object.");
        if (!file.type.startsWith('image/')) return Promise.reject("Specified file is not an image.");
        if (!boundBox || boundBox.length !== 2) return Promise.reject("Specified BBox is not valid.");
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext('2d');
                const fr = new FileReader();
                fr.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const { width, height, src, ...rest } = img;
                        const scaleRatio = Math.round(...boundBox) / Math.max(width, height);
                        canvas.width = width*scaleRatio;
                        canvas.height = height*scaleRatio;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve({
                            md5: CryptoJS.MD5(src).toString(),
                            width,
                            height,
                            src,
                            canvas,
                            file,
                            ...rest
                        });
                    };

                    img.src = fr.result; // is the data URL because called with readAsDataURL
                };
                fr.readAsDataURL(file);
            } catch(e) { reject(e); }
        });
    }

    onDrop(uPictures) {
        this.setState({loadingGallery: true})
        const pq = [];
        uPictures.forEach(p => {
            pq.push(this.getImage(p));
        });
        Promise.all(pq).then(res => {
            const photos = [ ...this.state.photos ];
            res.forEach(p => {
                const { md5 } = p;
                // Make sure we dont already have the image
                if (_.findIndex(photos, {md5}) === -1) {
                    const { width, height, src, canvas, file } = p;
                    photos.push({
                        src,
                        canvas,
                        width,
                        height,
                        file,
                        md5
                    });
                }
            });
            this.setState({
                photos,
                loadingGallery: false,
                galleryName: this.state.galleryName
                    ? this.state.galleryName
                    : photos[0] && photos[0].file && photos[0].file.name
                        ? _.startCase(photos[0].file.name.replace(/\.[^/.]+$/, ""))
                        : ""
            });
        }).catch(console.error)
    }

    getOnKeyDownConfirm(e, onConfirm) {
        switch (true) {
            case (e.key === "Tab"):
            case (e.key === "Enter"): {
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
        // const { token } = this.props;
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
            loadingGallery
        } = this.state;
        return (
            <Container>
                <Row>
                    <Col>
                        {/*<Dropzone onDrop={acceptedFiles => {
                            console.log(acceptedFiles);
                            // const upload = (file) => {
                            //     const data = new FormData();
                            //     data.append('file', file);
                            //     const myHeaders = new Headers({
                            //         'Authorization':  `Bearer ${token}`
                            //     });
                            //     const options = {
                            //         method: 'POST',
                            //         mode: 'cors',
                            //         cache: 'default',
                            //         headers: myHeaders,
                            //         body: data
                            //     };
                            //     fetch('/api/v1/upload', options).then(
                            //         response => response.json() // if the response is a JSON object
                            //     ).then(
                            //         success => console.log(success) // Handle the success response object
                            //     ).catch(console.error);
                            // };
                            // upload(acceptedFiles[0]);
                        }}>*/}
                        <Navbar className="navbar-light" style={{
                            padding: "5px 0 0 0",
                            border: "1px solid white",
                            margin: "10px 0",
                            borderRadius: "10px"
                        }}>
                            <Nav className="mr-auto" style={{
                                padding: "0 0 0 5px"
                            }}>
                                <Nav.Item style={{
                                    padding: "0 5px 0 0"
                                }}><Button onClick={this.onClearGallery} variant="danger"><FontAwesomeIcon icon={faTrash} /> Clear Gallery</Button ></Nav.Item>
                                <Nav.Item style={{
                                    padding: "0 5px 0 0"
                                }}><Button variant="info" onClick={sortDirection !== "Up" ? this.onSortUp : this.onSortDown}><FontAwesomeIcon icon={sortDirection === "Up" ? faSortCircleUp : sortDirection === "Down" ? faSortCircleDown : faSortCircle} /> Sorted: {sortDirection === "Up" ? "Ascending" : sortDirection === "Down" ? "Descending" : "Unsorted"}</Button></Nav.Item>
                                <Nav.Item style={{
                                    padding: "0 5px 0 0"
                                }}>
                                    <Dropzone onDrop={this.onDrop}>
                                        {({getRootProps, getInputProps}) => (
                                            <div {...getRootProps()}>
                                                <Button variant="info"><FontAwesomeIcon icon={faCloudUpload} /> Add images</Button >
                                                <input {...getInputProps()} />
                                            </div>
                                        )}
                                    </Dropzone>
                                </Nav.Item>
                            </Nav>
                            <Nav style={{
                                padding: "0 5px 0 0"
                            }}>
                                <Nav.Item><Button variant="success" onClick={this.onSubmitGallery}><FontAwesomeIcon icon={faCheckCircle} /> Submit New Gallery</Button></Nav.Item>
                            </Nav>
                        </Navbar>
                        <div className="preview-gallery">
                            <Gallery
                                sortable
                                useDragHandle
                                loading={loadingGallery}
                                galleryName={<InlineInputGroup
                                    textId="gallery-name-text"
                                    inputId="gallery-name-input"
                                    text={<h4 id="gallery-name-text">{galleryName || "Gallery Title"}</h4>}
                                    input={({onConfirm}) => <InputGroup className="mb-1">
                                        <FormControl
                                            placeholder="Title"
                                            aria-label="Title"
                                            aria-describedby="basic-addon1"
                                            required
                                            value={galleryName}
                                            onChange={e => {this.setState({galleryName: e.target.value});}}
                                            id="gallery-name-input"
                                            onKeyDown={(e) => this.getOnKeyDownConfirm(e, onConfirm)}
                                            onBlur={onConfirm}
                                        />
                                        <InputGroup.Append>
                                            <Button variant="success"><FontAwesomeIcon icon={faCheckCircle} onClick={onConfirm} /></Button>
                                        </InputGroup.Append>
                                        <FormControl.Feedback type="invalid">
                                            Please choose a gallery name.
                                        </FormControl.Feedback>
                                    </InputGroup>}
                                />}
                                galleryDescription={<InlineInputGroup
                                    textId="gallery-description-text"
                                    inputId="gallery-description-input"
                                    text={<span id="gallery-description-text"><strong>Description</strong>: {galleryDescription || "No description currently."}</span>}
                                    input={({onConfirm}) => <InputGroup className="mb-1">
                                        <FormControl
                                            placeholder="Description"
                                            aria-label="Description"
                                            aria-describedby="basic-addon1.1"
                                            required
                                            value={galleryDescription}
                                            onChange={e => {
                                                this.setState({galleryDescription: e.target.value});
                                            }}
                                            id="gallery-description-input"
                                            onKeyDown={(e) => this.getOnKeyDownConfirm(e, onConfirm)}
                                            onBlur={onConfirm}
                                        />
                                        <InputGroup.Append>
                                            <Button variant="success"><FontAwesomeIcon icon={faCheckCircle} onClick={onConfirm} /></Button>
                                        </InputGroup.Append>
                                        <FormControl.Feedback type="invalid">
                                            Please choose a gallery description.
                                        </FormControl.Feedback>
                                    </InputGroup>}
                                />}
                                releaseDate={<InlineInputGroup
                                    tooltipPlacement="right"
                                    textId="gallery-release-date-text"
                                    inputId="gallery-release-date-input"
                                    text={<span id="gallery-release-date-text">
                                        {releaseDate instanceof Date
                                            ? <h4><FontAwesomeIcon icon={faCalendar} /> {releaseDate.toLocaleDateString("en-US")}</h4>
                                            : null
                                        }
                                    </span>}
                                    input={({onConfirm}) => <InputGroup className="mb-1">
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
                                            Please choose a gallery release date &amp; time.
                                        </FormControl.Feedback>
                                    </InputGroup>}
                                />}
                                tags={<InlineInputGroup
                                    tooltipPlacement="right"
                                    textId="gallery-tags-text"
                                    inputId="gallery-tags-input"
                                    text={<div id="gallery-tags-text" className="badges-cloud">
                                                <FontAwesomeIcon icon={faTags} size="sm" /> <TagCloud tags={tags} />
                                            </div>}
                                    input={({onConfirm}) => <InputGroup className="mb-1">
                                        <FormControl
                                            placeholder="Add tag"
                                            aria-label="Add tag"
                                            aria-describedby="basic-addon3"
                                            value={tagInput}
                                            onChange={e => {
                                                this.setState({tagInput: e.target.value});
                                            }}
                                            onKeyDown={e => {
                                                switch (true) {
                                                    case (e.key === "Tab"):
                                                    case (e.key === "Enter"):
                                                    case (e.key === ","): {
                                                        e.preventDefault();
                                                        if (tagInput.length < 3) { return; }
                                                        this.setState({tagInput: "", tags: [ ...(tags.filter(t => t !== tagInput)), tagInput]});
                                                        break;
                                                    }
                                                    default: {
                                                        //
                                                    }
                                                }
                                            }}
                                            isValid ={tags.length > 0}
                                            isInvalid ={tags.length < this.minTags}
                                            id="gallery-tags-input"
                                        />
                                        <InputGroup.Append>
                                            <Button variant="success"><FontAwesomeIcon icon={faCheckCircle} onClick={onConfirm} /></Button>
                                        </InputGroup.Append>
                                        <FormControl.Feedback type="invalid">
                                            Please add {this.minTags - tags.length} more gallery tag{this.minTags - tags.length === 1 ? "" : "s"}.
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            <div className="align-left badges-cloud">
                                                <TagCloud
                                                    tags={tags}
                                                    removeable
                                                    handleRemove={i => {
                                                        this.setState({tags: tags.filter((t, index) => index !== i)});
                                                    }}
                                                    onSortEnd={this.onSortTagsEnd}
                                                    useDragHandle
                                                    sortable
                                                />
                                            </div>
                                        </FormControl.Feedback>
                                    </InputGroup>}
                                />}
                                photos={photos}
                                onOpenCarousel={this.openLightbox}
                                closeLightbox={this.closeLightbox}
                                onRemoveImage={this.onRemoveImage}
                                onSortEnd={this.onSortEnd}
                                viewerIsOpen={viewerIsOpen}
                                currentImage={currentImage}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default AdGallery;
