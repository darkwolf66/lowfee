import {Dropdown, Nav, Navbar, NavDropdown} from "react-bootstrap";
import React from "react";
import {NavLink} from "react-router-dom";

export default function Header(props){
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <div className="container-fluid">
                <NavLink className="brand navbar-brand" to={'/'}>LowFee</NavLink>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <NavLink to={'/'} className="nav-link">
                            Dashboard
                        </NavLink>
                        <NavLink to={'/fund-an-idea'} className="nav-link">
                            Fund an Idea
                        </NavLink>
                        <NavLink to={'/our-fees'} className="nav-link">
                            Our Fees
                        </NavLink>
                    </Nav>
                    <Nav>
                        <NavLink to={'/my/assets'} className="nav-link">
                            My Assets
                        </NavLink>
                        <NavLink to={'/token/my'} className="nav-link">
                            My Tokens
                        </NavLink>
                        <NavLink to={'/campaign/my'} className="nav-link">
                            My Campaigns
                        </NavLink>
                        <NavLink to={'/get-funded'} className="nav-link">
                            Launch Your Idea
                        </NavLink>
                        <div className="profile_picture_container">
                            <Dropdown drop="start">
                                <Dropdown.Toggle className="">
                                    <img src={"https://robohash.org/"+props.defaultAddress} className="profile_picture"/>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <input className="form-control" value={props.defaultAddress} readOnly/>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </div>
        </Navbar>
    )
}