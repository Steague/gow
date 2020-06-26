import React, { Component } from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { faTimesCircle } from "@fortawesome/pro-solid-svg-icons";

import "./TagCloud.scss";

class TagCloud extends Component {
    render() {
        const { tags, removeable = false, handleRemove = () => {} } = this.props;
        return (
            <span>
                {_.orderBy(
                    tags,
                    ["type", tag => tag.tag.toLowerCase()],
                    ["desc", "asc"]
                ).map(({ tag, type }, i) => (
                    <Badge
                        pill
                        key={`tag-${i}`}
                        index={i}
                        variant={type === "model" ? "primary" : ""}
                        className="border border-primary"
                    >
                        <span>
                            {removeable ? (
                                <span>
                                    {tag} |{" "}
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip id={`tooltip-${i}`}>
                                                Remove &quot;{tag}&quot; tag.
                                            </Tooltip>
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            style={{ cursor: "pointer" }}
                                            onClick={e => handleRemove(tag)}
                                        />
                                    </OverlayTrigger>
                                </span>
                            ) : (
                                <NavLink
                                    className="tag-nav-link text-body"
                                    to={`/galleries/tag/${tag}`}
                                >
                                    {tag}
                                </NavLink>
                            )}
                        </span>
                    </Badge>
                ))}
            </span>
        );
    }
}

export default TagCloud;
