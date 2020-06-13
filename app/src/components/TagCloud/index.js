import React, { Component } from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { SortableElement, SortableContainer } from "react-sortable-hoc";
import SortableHandle from "../SortableHandle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; //

import { faTimesCircle } from "@fortawesome/pro-solid-svg-icons";

class TagCloud extends Component {
    constructor(props) {
        super(props);

        this.getWrapper = this.getWrapper.bind(this);
    }

    getWrapper() {
        const { sortable } = this.props;
        const htmlTag = props => <Badge {...props} />;
        return sortable ? SortableElement(htmlTag) : htmlTag;
    }

    render() {
        const { tags, removeable = false, handleRemove = () => {} } = this.props;
        const TagWrapper = this.getWrapper();
        return (
            <span>
                {tags.map((w, i) => (
                    <TagWrapper pill key={`tag-${i}`} index={i} variant="primary">
                        <span>
                            {removeable ? (
                                <span>
                                    <SortableHandle>
                                        <span>{w}</span>
                                    </SortableHandle>{" "}
                                    |{" "}
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip id={`tooltip-${i}`}>
                                                Remove &quot;{w}&quot; tag.
                                            </Tooltip>
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            style={{ cursor: "pointer" }}
                                            onClick={e => handleRemove(i)}
                                        />
                                    </OverlayTrigger>
                                </span>
                            ) : (
                                w
                            )}
                        </span>
                    </TagWrapper>
                ))}
            </span>
        );
    }
}

export default SortableContainer(TagCloud);
