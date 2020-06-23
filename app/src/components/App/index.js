import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import Menu from "../Menu";
import Admin from "../Admin";
import Galleries from "./Galleries";
import Gallery from "./Gallery";
import PrivateRoute from "../PrivateRoute";
import Navbar from "../Navbar";
import config from "../../config/config.json";
import { connect } from "react-redux";
import CookieConsent from "react-cookie-consent";
import { Button } from "react-bootstrap";

import "./App.scss";

class App extends Component {
    constructor(props) {
        super(props);

        this.initLoginS6tate = {
            isAuthenticated: false,
            authPending: true,
            user: null,
            token: ""
        };

        this.state = {
            ...this.initLoginS6tate
        };

        this.responseGoogleSuccess = this.responseGoogleSuccess.bind(this);
        this.responseGoogleRequest = this.responseGoogleRequest.bind(this);
        this.responseGoogleLogoutSuccess = this.responseGoogleLogoutSuccess.bind(this);
        this.responseGoogleFailure = this.responseGoogleFailure.bind(this);
    }
    componentDidMount() {
        //
    }
    getGoogleLoginStateButton() {
        const { token } = this.state;
        if (!token) {
            return (
                <GoogleLogin
                    clientId={config.development.web.client_id}
                    theme="dark"
                    buttonText="Sign in with Google"
                    onSuccess={this.responseGoogleSuccess}
                    onFailure={this.responseGoogleFailure}
                    onRequest={this.responseGoogleRequest}
                    cookiePolicy={"single_host_origin"}
                    isSignedIn={true}
                    className="google-nav-link"
                />
            );
        } else {
            return (
                <GoogleLogout
                    clientId={config.development.web.client_id}
                    theme="dark"
                    buttonText="Logout"
                    onLogoutSuccess={this.responseGoogleLogoutSuccess}
                    className="google-nav-link"
                />
            );
        }
    }
    responseGoogleSuccess(response) {
        // if (!response) return;
        const myHeaders = new Headers({
            Authorization: `Bearer ${response.tokenId}`
        });
        const options = {
            method: "POST",
            mode: "cors",
            cache: "default",
            headers: myHeaders
        };
        fetch("/api/v1/auth/google", options).then(r => {
            const token = r.headers.get("x-auth-token");
            r.json().then(user => {
                if (token) {
                    this.setState({
                        isAuthenticated: true,
                        authPending: false,
                        user,
                        token
                    });
                }
            });
        });
    }
    responseGoogleRequest(response) {
        this.setState({ authPending: true });
    }
    responseGoogleLogoutSuccess(response) {
        const loginState = this.initLoginS6tate;
        loginState.authPending = false;
        this.setState(loginState);
    }
    responseGoogleFailure(response) {
        const loginState = this.initLoginS6tate;
        loginState.authPending = false;
        this.setState(loginState);
    }
    render() {
        const { isAuthenticated, authPending, token } = this.state;
        return (
            <Router>
                <div id="outer-container">
                    <div className="left">
                        <Menu
                            googleLoginStateButton={this.getGoogleLoginStateButton()}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>

                    <div id="page-wrap">
                        <Navbar
                            isAuthenticated={isAuthenticated}
                            authPending={authPending}
                        />

                        <Switch>
                            <PrivateRoute
                                path="/admin"
                                isAuthenticated={isAuthenticated}
                                authPending={authPending}
                            >
                                <Admin token={token} />
                            </PrivateRoute>
                            <Route
                                path="/gallery/:id/:tab"
                                render={props => <Gallery />}
                            />
                            <Route path="/gallery/:id" render={props => <Gallery />} />
                            <Route path="/" render={props => <Galleries />} />
                        </Switch>
                    </div>
                </div>
                <CookieConsent
                    location="bottom"
                    buttonText="I Accept"
                    cookieName="Consent-2020-06-18-Cookie-Accept"
                    ButtonComponent={props => <Button {...props} />}
                    disableButtonStyles={true}
                    buttonStyle={{ margin: "2rem" }}
                    buttonClasses="btn btn-success"
                    expires={150}
                    overlay={true}
                >
                    <h4>We value your privacy</h4>
                    <h6>
                        We and our partners use technologies, such as cookies, and process
                        personal data, such as IP addresses and cookie identifiers, to
                        personalise ads and content based on your interests, measure the
                        performance of ads and content, and derive insights about the
                        audiences who saw ads and content. Click the button on the right
                        to consent to the use of this technology and the processing of
                        your personal data for these purposes.
                    </h6>
                </CookieConsent>
            </Router>
        );
    }
}

const mapStateToProps = state => ({
    theme: state.theme.theme
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(App);
