import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Header from "./layout/Header";
import Sidenav from "./layout/Sidenav";
import "../assets/styles/header.css";

const Layout = ({ children }) => {
    const location = useLocation();
    const [showSidenav, setShowSidenav] = useState(window.innerWidth >= 992);

    useEffect(() => {
        // Add a class to body for fixed layout adjustments
        document.body.classList.add('fixed-layout');
        
        // Handle window resize
        const handleResize = () => {
            setShowSidenav(window.innerWidth >= 992);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup function
        return () => {
            document.body.classList.remove('fixed-layout');
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const toggleSidenav = () => {
        setShowSidenav(prev => !prev);
    };

    return (
        <div key={location.pathname}>
            <Header toggleSidenav={toggleSidenav} />
            <div className={"container-fluid"}>
                <div className={"row"}>
                    {(showSidenav || window.innerWidth >= 992) && <Sidenav />}
                    <main className={showSidenav ? "col-lg-10 main-content" : "col-12 main-content"}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired
};

export default Layout;