import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';//

import { faEdit } from '@fortawesome/pro-solid-svg-icons';

class InlineInputGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: props.defaultMode || "text",
            textId: null,
            inputId: null
        };

        this.toggleMode = this.toggleMode.bind(this);
    }

    componentDidMount() {
        this.setupEvents();
    }

    toggleMode(override) {
        const mode = override ? override : this.state.mode !== "text" ? "text" : "input";
        this.setState({mode}, () => {
            if (mode === "text") return;
            this.state.inputId.focus();
        });
    }

    setupEvents() {
        const { inputId: iId, textId: tId, input } = this.props;
        const inputId = document.querySelector(`#${iId}`);
        if (typeof input !== "function") {
            inputId.addEventListener("blur", () => setTimeout(this.toggleMode, 100));
        }

        const textId = document.querySelector(`#${tId}`);;
        textId.addEventListener("click", this.toggleMode);

        this.setState({inputId, textId});
    }

    render() {
        const { mode } = this.state;
        const { text, input, textId, inputId, tooltipPlacement, onConfirm, ...rest } = this.props;
        return (
            <span {...rest}>
                <span style={{cursor: "pointer", display: mode === "text" ? "inherit" : "none"}}>
                    <OverlayTrigger
                        placement={tooltipPlacement || "left"}
                        overlay={<Tooltip id={`tooltip-${textId}`}><FontAwesomeIcon icon={faEdit} /></Tooltip>}
                    >
                        {text}
                    </OverlayTrigger>
                </span>
                <span style={{display: mode !== "text" ? "inherit" : "none"}}>{typeof input === "function" ? input({onConfirm: () => this.toggleMode("text")}) : input}</span>
            </span>
        );
    }
}

export default InlineInputGroup;
