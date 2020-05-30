import React, { Component } from 'react';
import {
    Switch,
    Route,
    withRouter
} from "react-router-dom";
import AddGallery from './AddGallery';

import "react-datepicker/dist/react-datepicker.css";
import './Admin.scss';

class Admin extends Component {
    render() {
        const { path } = this.props.match;
        // const { token } = this.props;
        return (
            <div>
                <h1>Admin</h1>
                <Switch>
                    <Route exact path={path}>
                        <h3>Please select an action.</h3>
                    </Route>
                    <Route path={`${path}/add`}>
                        <AddGallery />
                    </Route>
                </Switch>
            </div>
        );
    }
}

export default withRouter(Admin);
