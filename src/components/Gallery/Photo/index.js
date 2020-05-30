import React, { Component } from 'react';
import SortableHandle from '../../SortableHandle';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrows, faTrash } from '@fortawesome/pro-solid-svg-icons';

class Photo extends Component {
    render() {
        const imgWithClick = { cursor: "pointer" };
        const { onOpenCarousel, onRemoveImage, photo, pIndex, margin, direction, top, left, sortable = false, removeable = false } = this.props;
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
                <img alt={photo.name} {...photo} onClick={e => onOpenCarousel(pIndex)} />
                {sortable
                    ?
                        <SortableHandle>
                            <Button variant="info" className="drag-handle" size="sm"><FontAwesomeIcon icon={faArrows} /></Button>
                        </SortableHandle>
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
