import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { LoremIpsum } from 'react-lorem-ipsum';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import Menu from "../Menu";
import PrivateRoute from "../PrivateRoute";
import config from "../../config.json";
import "./App.scss";

class App extends Component {
    constructor(props) {
        super(props);

        this.initLoginS6tate = {
            isAuthenticated: false,
            authPending: true,
            user: null,
            token: ''
        };

        this.state = this.initLoginS6tate;

        this.responseGoogleSuccess = this.responseGoogleSuccess.bind(this);
        this.responseGoogleRequest = this.responseGoogleRequest.bind(this);
        this.responseGoogleLogoutSuccess = this.responseGoogleLogoutSuccess.bind(this);
        this.responseGoogleFailure = this.responseGoogleFailure.bind(this);
    }
    componentDidMount() {
        //console.log(config);
    }
    getGoogleLoginStateButton() {
        const { token } = this.state;
        if (!token) {
            return (
                <GoogleLogin
                    clientId={config.web.client_id}
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
                    clientId={config.web.client_id}
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
        const { isAuthenticated, authPending } = this.state;
        return (
            <Router>
                <div id="outer-container">
                    <div className="left">
                        <Menu
                            googleLoginStateButton={this.getGoogleLoginStateButton()}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>

                    <main id="page-wrap">
                        <Switch>
                            <PrivateRoute path="/admin" isAuthenticated={isAuthenticated} authPending={authPending}>
                                <h1>Admin</h1>
                                <LoremIpsum p={3} />
                            </PrivateRoute>
                            <Route exact path="/">
                                <h1>Home</h1>
                                <LoremIpsum p={10} />
                            </Route>
                        </Switch>
                    </main>
                </div>
            </Router>
        );
    }
}

export default App;