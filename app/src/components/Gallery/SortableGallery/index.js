import React, { PureComponent } from "react";
import Gallery from "react-photo-gallery";
import { SortableContainer } from "react-sortable-hoc";
import SortablePhoto from "../SortablePhoto";

class SortableGallery extends PureComponent {
    render() {
        const {
            photos,
            onOpenCarousel,
            onRemoveImage,
            onMakeFeaturedImage,
            targetRowHeight
        } = this.props;
        return (
            <Gallery
                photos={photos}
                renderImage={props => (
                    <SortablePhoto
                        {...props}
                        sortable
                        removeable
                        featureable
                        pIndex={props.index}
                        onOpenCarousel={onOpenCarousel ? onOpenCarousel : () => {}}
                        onRemoveImage={onRemoveImage ? onRemoveImage : () => {}}
                        onMakeFeaturedImage={
                            onMakeFeaturedImage ? onMakeFeaturedImage : () => {}
                        }
                    />
                )}
                targetRowHeight={targetRowHeight}
            />
        );
    }
}

export default SortableContainer(SortableGallery);
