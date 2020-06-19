import React, { Component } from "react";
import Carousel, { Modal, ModalGateway } from "react-images";

class Lightbox extends Component {
    render() {
        const { viewerIsOpen, closeLightbox, currentImage, photos } = this.props;
        return (
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
        );
    }
}

export default Lightbox;
