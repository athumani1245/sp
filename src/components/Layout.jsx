import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Header from "./layout/Header";
import Sidenav from "./layout/Sidenav";

const Layout = ({ children }) => {
    useEffect(() => {
        // Add a class to body for fixed layout adjustments
        document.body.classList.add('fixed-layout');
        
        // Cleanup function to remove the class when component unmounts
        return () => {
            document.body.classList.remove('fixed-layout');
        };
    }, []);

    return (
        <>
            <Header />
            <div className={"container-fluid"}>
                <div className={"row"}>
                    <Sidenav />
                    <main className={"col-md-10 main-content"}>
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired
};

export default Layout;