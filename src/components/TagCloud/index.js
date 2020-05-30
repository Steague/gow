import React, { Component } from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';//

import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons';

class TabCloud extends Component {

    render() {
        const { tags, removeable = false, handleRemove = () => {} } = this.props;
        return tags.map((w, i) => (
            <Badge pill key={`tag-${i}`} variant="primary">
                <span>
                    {removeable
                        ?
                            <span>
                                {w} | <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id={`tooltip-${i}`}>Remove &quot;{w}&quot; tag.</Tooltip>}
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} style={{cursor: "pointer"}} onClick={e => handleRemove(i)} />
                                </OverlayTrigger>
                            </span>
                        : w
                    }
                </span>
            </Badge>
        ));
    }

}

export default TabCloud;
