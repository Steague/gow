import React, { Component } from 'react';
import { loremIpsum  } from 'react-lorem-ipsum';
import {
    Switch,
    Route,
    withRouter
} from "react-router-dom";
import _ from 'lodash';
import Dropzone from 'react-dropzone';
// import FlipMove from 'react-flip-move';
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import { SortableContainer, SortableElement, sortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move";
import CryptoJS from "crypto-js";
import { Button, ButtonGroup, InputGroup, FormControl, Container, Row, Col, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { confirm } from '../ConfirmDialog';
import DatePicker from "react-datepicker";
import ReactLoading from 'react-loading';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrows, faTrash, faTimesCircle, faSortCircle, faSortCircleUp, faSortCircleDown, faCloudUpload, faCalendar, faClock, faPlus, faTags, faEyeSlash, faCheckCircle } from '@fortawesome/pro-solid-svg-icons';

import "react-datepicker/dist/react-datepicker.css";
import './Admin.scss';

library.add(faArrows, faTrash, faTimesCircle, faSortCircle, faSortCircleUp, faSortCircleDown, faCloudUpload, faCalendar, faClock, faPlus, faTags, faEyeSlash, faCheckCircle);

class Handle extends Component {
    render() {
        return (<Button className="drag-handle" size="sm"><FontAwesomeIcon icon={faArrows} /></Button>);
    }
}
class Photo extends Component {
    render() {
        const imgWithClick = { cursor: "pointer" };
        const { onOpenCarousel, onRemoveImage, key, photo, margin, direction, top, left } = this.props;
        const imgStyle = {
            margin,
            position: "relative"
        };
        if (direction === "column") {
            imgStyle.position = "absolute";
            imgStyle.left = left;
            imgStyle.top = top;
        }
        photo.src = photo.thumb.src;
        return (
            <div
                style={onOpenCarousel ? { ...imgStyle, ...imgWithClick } : imgStyle}
                key={key}
            >
                <img alt={photo.name} {...photo} onClick={(e) => onOpenCarousel(e, this.props)} />
                <DragHandle />
                <Button className="remove-handle" size="sm" variant="danger" onClick={(e) => onRemoveImage(e, this.props)}><FontAwesomeIcon icon={faTrash} /></Button>
            </div>
        );
    }
}

class GalleryComp extends Component {
    render() {
        const { photos, onOpenCarousel, onRemoveImage } = this.props;
        return (
            <Gallery photos={photos} renderImage={props =>
                <SortablePhoto
                    {...props}
                    pIndex={props.index}
                    onOpenCarousel={onOpenCarousel ? onOpenCarousel : () => {}}
                    onRemoveImage={onRemoveImage ? onRemoveImage : () => {}}
                />}
            />
        );
    }
}

const DragHandle = sortableHandle(Handle);
const SortablePhoto = SortableElement(Photo);
const SortableGallery = SortableContainer(GalleryComp);

class Admin extends Component {
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
            keywordInput: "",
            keywords: {},
            loadingGallery: false
        };

        this.getImage = this.getImage.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);
        this.onSortUp = this.onSortUp.bind(this);
        this.onSortDown = this.onSortDown.bind(this);
        this.onClearGallery = this.onClearGallery.bind(this);
        this.onReleaseDateChange = this.onReleaseDateChange.bind(this);
        this.onSubmitGallery = this.onSubmitGallery.bind(this);
    }

    async onSubmitGallery(e) {
        e.preventDefault();
        if (await confirm("Are your sure?", "Proceed", "Cancel", {title: "Confirm galley submission", proceedVariant: "success"})) {

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

    onSortEnd({ oldIndex, newIndex }) {
        this.setState({
            photos: arrayMove(this.state.photos, oldIndex, newIndex),
            sortDirection: ""
        });
    }

    onRemoveImage(event, {photo, pIndex}) {
        this.setState({photos: _.remove(this.state.photos, (p,i) => i !== pIndex)});
    }

    openLightbox(event, {photo, pIndex}) {
        this.setState({
            currentImage: pIndex,
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
                        const thumb = {
                            src: canvas.toDataURL(file.type),
                            width: canvas.width,
                            height: canvas.height,
                            canvas
                        };
                        resolve({
                            md5: CryptoJS.MD5(src).toString(),
                            width,
                            height,
                            src,
                            thumb,
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
                const { width, height, src, thumb, file, md5 } = p;
                // Make sure we donta lready have the image
                if (_.findIndex(photos, {md5}) === -1) {
                    photos.push({
                        src,
                        thumb,
                        width,
                        height,
                        file,
                        md5
                    });
                }
            });
            // console.log("setting pictures state", pictures);
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

    render() {
        const { path } = this.props.match;
        // const { token } = this.props;
        const {
            photos,
            currentImage,
            viewerIsOpen,
            sortDirection,
            galleryName,
            galleryDescription,
            releaseDate,
            keywordInput,
            keywords,
            loadingGallery
        } = this.state;
        return (
            <div>
                <h1>Admin</h1>
                <Switch>
                    <Route exact path={path}>
                        <h3>Please select an action.</h3>
                    </Route>
                    <Route path={`${path}/add`}>
                        <div>
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
                            <Container>
                                <Row>
                                    <Col xs={4}>
                                        <Dropzone onDrop={this.onDrop}>
                                            {({getRootProps, getInputProps}) => (
                                                <div {...getRootProps()} style={{cursor: "pointer", border: "2px dashed white", borderRadius: "10px", padding: "20px"}}>
                                                    <FontAwesomeIcon size="10x" icon={faCloudUpload} />
                                                    <input {...getInputProps()} />
                                                    <p>Drag 'n' drop some files here, or click to select files</p>
                                                </div>
                                            )}
                                        </Dropzone>
                                    </Col>
                                    <Col xs={8}>
                                        <InputGroup className="mb-1">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="basic-addon1">Gallery</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl
                                                placeholder="Name"
                                                aria-label="Name"
                                                aria-describedby="basic-addon1"
                                                value={galleryName}
                                                onChange={e => {
                                                    this.setState({galleryName: e.target.value});
                                                }}
                                            />
                                        </InputGroup>
                                        <InputGroup className="mb-1">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="basic-addon1.1">Description</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl
                                                placeholder="Description"
                                                aria-label="Description"
                                                aria-describedby="basic-addon1.1"
                                                value={galleryDescription}
                                                onChange={e => {
                                                    this.setState({galleryDescription: e.target.value});
                                                }}
                                            />
                                        </InputGroup>
                                        <InputGroup className="mb-1">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="basic-addon2"><FontAwesomeIcon icon={faCalendar} />&nbsp;<FontAwesomeIcon icon={faPlus} />&nbsp;<FontAwesomeIcon icon={faClock} /></InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <DatePicker
                                                selected={releaseDate}
                                                onChange={this.onReleaseDateChange}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15}
                                                timeCaption="time"
                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                fixedHeight
                                                className="form-control bs-date-picker"
                                                aria-describedby="basic-addon2"
                                            />
                                        </InputGroup>
                                        <InputGroup className="mb-1">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="basic-addon3"><FontAwesomeIcon icon={faTags} /></InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <FormControl
                                                placeholder="Add keywords"
                                                aria-label="Add tags"
                                                aria-describedby="basic-addon3"
                                                value={keywordInput}
                                                onChange={e => {
                                                    this.setState({keywordInput: e.target.value});
                                                }}
                                                onKeyPress={e => {
                                                    switch (true) {
                                                        case (e.key === "Enter"):
                                                        case (e.key === ","): {
                                                            e.preventDefault();
                                                            if (keywordInput.length < 3) { return; }
                                                            this.setState({keywordInput: "", keywords: { ...keywords, [keywordInput]: keywordInput}});
                                                            break;
                                                        }
                                                        default: {
                                                            //console.log("state control key");
                                                        }
                                                    }
                                                }}
                                            />
                                        </InputGroup>
                                        {keywords ? <div className="align-left badges-cloud">
                                            {_.map(keywords, (w, i) => (
                                                <Badge pill key={`keyword-${i}`} variant="primary">
                                                    <span>{w} | </span>
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip id={`tooltip-${i}`}>
                                                                Remove &quot;{w}&quot;tag.
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <FontAwesomeIcon icon={faTimesCircle} style={{cursor: "pointer"}} onClick={e => {
                                                            const newKeywords = { ...keywords };
                                                            delete newKeywords[w];
                                                            this.setState({keywords: newKeywords});
                                                        }} />
                                                    </OverlayTrigger>
                                                </Badge>
                                            ))}
                                        </div> : null}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <ButtonGroup aria-label="Actions">
                                            <Button onClick={this.onClearGallery} variant="danger"><FontAwesomeIcon icon={faTrash} /></Button>
                                            <Button onClick={sortDirection !== "Up" ? this.onSortUp : this.onSortDown}><FontAwesomeIcon icon={sortDirection === "Up" ? faSortCircleUp : sortDirection === "Down" ? faSortCircleDown : faSortCircle} /></Button>
                                            <Button onClick={this.onSubmitGallery} variant="success"><FontAwesomeIcon icon={faCheckCircle} /></Button>
                                        </ButtonGroup >
                                        <div className="preview-gallery">
                                            <Row>
                                                <Col xs={9}>
                                                    <h4>{galleryName || "Preview Gallery"}</h4>
                                                </Col>
                                                <Col xs={3} className="align-right">
                                                    <h4><FontAwesomeIcon icon={faCalendar} /> {releaseDate.toLocaleDateString("en-US")}</h4>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={9}>
                                                    <strong>Description</strong>: {galleryDescription || loremIpsum({p: 1, avgSentencesPerParagraph:4})}
                                                </Col>
                                                <Col xs={3} className="align-right">
                                                    {_.keys(keywords).length ? <div className="badges-cloud">
                                                        <span><FontAwesomeIcon icon={faTags} size="sm" /> {_.map(keywords, (w, i) => (
                                                            <Badge pill key={`keyword-${i}`} variant="primary">{w}</Badge>
                                                        ))}</span>
                                                    </div> : null}
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={12}>
                                                    {loadingGallery
                                                        ?
                                                            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                                <ReactLoading type={"cylon"} color={"#FFFFFF"} height={'20%'} width={'20%'} />
                                                            </div>
                                                        : photos.length
                                                            ?
                                                                <SortableGallery
                                                                    photos={photos}
                                                                    useDragHandle={true}
                                                                    onOpenCarousel={this.openLightbox}
                                                                    onRemoveImage={this.onRemoveImage}
                                                                    onSortEnd={this.onSortEnd} axis={"xy"}
                                                                />
                                                            :
                                                                <div style={{fontSize: "40px", textAlign: "center", marginTop: "50px"}}>
                                                                    <span><FontAwesomeIcon icon={faEyeSlash} /> Empty Gallery</span>
                                                                </div>
                                                    }
                                                </Col>
                                            </Row>
                                            <ModalGateway>
                                                {viewerIsOpen ? (
                                                    <Modal onClose={this.closeLightbox}>
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
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </Route>
                </Switch>
            </div>
        );
    }
}

export default withRouter(Admin);
