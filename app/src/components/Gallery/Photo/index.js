import React, { Component } from 'react';
import SortableHandle from '../../SortableHandle';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrows, faSparkles, faTrash } from '@fortawesome/pro-solid-svg-icons';

class Photo extends Component {
    render() {
        const imgWithClick = { cursor: "pointer" };
        const { onOpenCarousel, onRemoveImage, onMakeFeaturedImage, photo: {name, src, width, height}, pIndex, margin, direction, top, left, featureable = false, sortable = false, removeable = false } = this.props;
        const imgStyle = {
            margin,
            position: "relative"
        };
        if (direction === "column") {
            imgStyle.position = "absolute";
            imgStyle.left = left;
            imgStyle.top = top;
        }
        // photo.src = photo.canvas.toDataURL(photo.file.type);
        return (
            <div
                style={onOpenCarousel ? { ...imgStyle, ...imgWithClick } : imgStyle}
            >
                <img alt={name} src={src} width={width} height={height} onClick={e => onOpenCarousel(pIndex)} />
                {sortable
                    ?
                        <SortableHandle>
                            <Button variant="info" className="drag-handle" size="sm"><FontAwesomeIcon icon={faArrows} /></Button>
                        </SortableHandle>
                    : null }
                {featureable
                    ?
                        <Button variant="info" className="set-feature-image-button" size="sm" onClick={e => onMakeFeaturedImage(pIndex)}><FontAwesomeIcon icon={faSparkles} /></Button>
                    : null }
                {removeable
                    ?
                        <Button className="remove-handle" size="sm" variant="danger" onClick={e => onRemoveImage(pIndex)}><FontAwesomeIcon icon={faTrash} /></Button>
                    : null }
            </div>
        );
    }
}

export default Photo;
