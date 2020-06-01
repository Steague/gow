import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Col, Row, Nav, NavDropdown, Navbar, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { setTheme } from '../../actions';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/pro-solid-svg-icons';

import './Navbar.scss';

library.add(faCog);

class GowNavbar extends Component {
    constructor(props) {
        super(props);

        this.onChangeTheme = this.onChangeTheme.bind(this);
    }

    onChangeTheme(e) {
        this.props.setTheme(e.target.checked ? "darkly" : "default");
    }

    render() {
        const { isAuthenticated, authPending, getGoogleLoginStateButton, theme, setTheme, ...rest } = this.props;
        return (
            <Navbar {...rest}  fixed="top" className="navbar-dark bg-primary" style={{paddingLeft: "calc(36px + 1.5rem)"}}>
                <Container>
                    <Row style={{width: "100%"}}>
                        <Col xs={11}>
                            <Nav className="mr-auto">
                                <NavLink className="nav-link" to="/">Home</NavLink>
                                <NavLink className="nav-link" to="/photos">Photos</NavLink>
                                <NavLink className="nav-link" to="/videos">Videos</NavLink>
                                {isAuthenticated &&
                                    <NavDropdown title="Admin" id="admin-actions-dropdown">
                                        <div className="dropdown-item"><NavLink to="/admin/add">Add Gallery</NavLink></div>
                                    </NavDropdown>
                                }
                            </Nav>
                            {/*<Form inline>
                                <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                                <Button variant="outline-success">Search</Button>
                            </Form>*/}
                        </Col>
                        <Col xs={1}>
                            <Nav id="settings-actions-nav">
                                <NavDropdown title={<Button variant="outline-success"><FontAwesomeIcon icon={faCog} /></Button>} alignRight id="settings-actions-dropdown">
                                    <div className="dropdown-item">
                                        <div className="custom-control custom-switch">
                                            <input type="checkbox" className="custom-control-input" id="themeSwitch1" onChange={this.onChangeTheme} checked={theme === "darkly" ? "checked" : ""} />
                                            <label className="custom-control-label" htmlFor="themeSwitch1">Dark</label>
                                        </div>
                                    </div>
                                </NavDropdown>
                            </Nav>
                        </Col>
                    </Row>
                </Container>
            </Navbar>
        );
    }
}

const mapStateToProps = state => ({
    theme: state.theme
});

const mapDispatchToProps = dispatch => ({
    setTheme: text => dispatch(setTheme(text))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GowNavbar);
