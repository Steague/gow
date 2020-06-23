import React, { Component } from "react";
import { Toast } from "react-bootstrap";
import { connect } from "react-redux";
import { removeNotification, hideNotification } from "../../actions";

class Notifications extends Component {
    render() {
        const { notifications, hideNotification } = this.props;
        console.log("notifications", notifications);
        return (
            <div
                style={{
                    position: "absolute",
                    left: "0.5rem",
                    bottom: "0.5rem",
                    minWidth: "25rem"
                }}
            >
                {notifications.map(({ id, header = "", body = "", show = true }, i) => (
                    <Toast
                        key={`toast=${i}`}
                        onClose={() => hideNotification(id)}
                        show={show}
                        className="bg-dark border-light"
                    >
                        <Toast.Header className="bg-primary text-body text-capitalize">
                            <strong className="mr-auto">{header}</strong>
                        </Toast.Header>
                        <Toast.Body>{body}</Toast.Body>
                    </Toast>
                ))}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    notifications: state.notifications
});

const mapDispatchToProps = dispatch => ({
    removeNotification: id => dispatch(removeNotification(id)),
    hideNotification: id => dispatch(hideNotification(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
