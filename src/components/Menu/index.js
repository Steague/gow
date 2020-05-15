import React, { Component } from 'react';
import { slide as Menu } from 'react-burger-menu';
import { NavLink } from 'react-router-dom';
import './Menu.scss';

class BurgerMenu extends Component {
    showSettings (event) {
        event.preventDefault();
    }

    render () {
        const { googleLoginStateButton, isAuthenticated } = this.props;
        return (
            <Menu className="nav nav-pills flex-column bg-dark">
                <li className="nav-item">
                    <NavLink exact className="nav-link" to="/">Home</NavLink>
                </li>
                {isAuthenticated &&
                    <li className="nav-item">
                        <NavLink exact className="nav-link" to="/admin">Admin</NavLink>
                    </li>
                }
                <li className="nav-item">
                    {googleLoginStateButton}
                </li>
            </Menu>
        );
    }
}

export default BurgerMenu;
