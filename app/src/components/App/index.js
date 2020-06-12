import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import Menu from "../Menu";
import Admin from "../Admin";
import Galleries from './Galleries';
import Gallery from './Gallery';
import PrivateRoute from "../PrivateRoute";
import Navbar from "../Navbar";
import config from "../../config/config.json";
import { connect } from 'react-redux';


import './App.scss';

class App extends Component {
    constructor(props) {
        super(props);

        this.initLoginS6tate = {
            isAuthenticated: false,
            authPending: true,
            user: null,
            token: ''
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
                    cookiePolicy={'single_host_origin'}
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
            'Authorization':  `Bearer ${response.tokenId}`
        });
        const options = {
            method: 'POST',
            mode: 'cors',
            cache: 'default',
            headers: myHeaders
        };
        fetch('/api/v1/auth/google', options).then(r => {
            const token = r.headers.get('x-auth-token');
            r.json().then(user => {
                if (token) {
                    this.setState({isAuthenticated: true, authPending: false, user, token})
                }
            });
        })
    }
    responseGoogleRequest(response) {
        this.setState({authPending : true});
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
                    <Menu
                        googleLoginStateButton={this.getGoogleLoginStateButton()}
                        isAuthenticated={isAuthenticated}
                    />

                    <Navbar
                        isAuthenticated={isAuthenticated}
                        authPending={authPending}
                    />

                    <div id="page-wrap">
                        <Switch>
                            <PrivateRoute path="/admin" isAuthenticated={isAuthenticated} authPending={authPending}>
                                <Admin token={token} />
                            </PrivateRoute>
                            <Route path="/gallery/:id" render={props => <Gallery />} />
                            <Route path="/" render={props => <Galleries />} />
                        </Switch>
                    </div>
                </div>
            </Router>
        );
    }
}

const mapStateToProps = state => ({
    theme: state.theme.theme
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
