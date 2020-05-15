import React, { Component } from 'react';
import {
  Route,
  Redirect
} from "react-router-dom";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

class PrivateRoute extends Component {
    render () {
        const { children, isAuthenticated, authPending, ...rest } = this.props;
        return (
            <Route
                {...rest}
                render={({ location }) =>
                    isAuthenticated && authPending === false ? (
                        children
                    ) : authPending !== false ? (
                        <SkeletonTheme color="#202020" highlightColor="#444">
                            <h1><Skeleton /></h1>
                            <p>
                                <Skeleton count={5} />
                            </p>
                            <p>
                                <Skeleton count={5} />
                            </p>
                            <p>
                                <Skeleton count={5} />
                            </p>
                        </SkeletonTheme>
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/",
                                state: { from: location }
                            }}
                        />
                    )
                }
            />
        );
    }
}

export default PrivateRoute;
