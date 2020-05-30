import React, { Component } from 'react';
import Gallery from "react-photo-gallery";
import { SortableContainer } from "react-sortable-hoc";
import SortablePhoto from '../SortablePhoto';

class SortableGallery extends Component {
    render() {
        const { photos, onOpenCarousel, onRemoveImage } = this.props;
        return (
            <Gallery photos={photos} renderImage={props =>
                <SortablePhoto
                    {...props}
                    sortable
                    removeable
                    pIndex={props.index}
                    onOpenCarousel={onOpenCarousel ? onOpenCarousel : () => {}}
                    onRemoveImage={onRemoveImage ? onRemoveImage : () => {}}
                />}
            />
        );
    }
}

export default SortableContainer(SortableGallery);
