import React, { Component } from "react";
import { SortableElement } from "react-sortable-hoc";
import Photo from "../Photo";

class SortablePhoto extends Component {
    render() {
        const {
            onOpenCarousel,
            onRemoveImage,
            onMakeFeaturedImage,
            ...props
        } = this.props;
        return (
            <Photo
                {...props}
                onOpenCarousel={onOpenCarousel ? onOpenCarousel : () => {}}
                onRemoveImage={onRemoveImage ? onRemoveImage : () => {}}
                onMakeFeaturedImage={onMakeFeaturedImage ? onMakeFeaturedImage : () => {}}
            />
        );
    }
}

export default SortableElement(SortablePhoto);
