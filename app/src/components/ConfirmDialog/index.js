import React from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { confirmable, createConfirmation } from "react-confirm";

class Confirmation extends React.Component {
    render() {
        const {
            proceedLabel = null,
            cancelLabel = null,
            title,
            confirmation,
            show,
            proceed,
            enableEscape = true,
            cancelVariant = "primary",
            proceedVariant = "primary"
        } = this.props;
        return (
            <div className="static-modal">
                <Modal
                    show={show}
                    onHide={() => proceed(false)}
                    backdrop={enableEscape ? true : "static"}
                    keyboard={enableEscape}
                >
                    <Modal.Header>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{confirmation}</Modal.Body>
                    <Modal.Footer>
                        {cancelLabel && (
                            <Button
                                variant={cancelVariant}
                                onClick={() => proceed(false)}
                            >
                                {cancelLabel}
                            </Button>
                        )}
                        {proceedLabel && (
                            <Button
                                variant={proceedVariant}
                                onClick={() => proceed(true)}
                            >
                                {proceedLabel}
                            </Button>
                        )}
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export function confirm(
    confirmation,
    proceedLabel = "OK",
    cancelLabel = "cancel",
    options = {}
) {
    return createConfirmation(confirmable(Confirmation))({
        confirmation,
        proceedLabel,
        cancelLabel,
        ...options
    });
}
