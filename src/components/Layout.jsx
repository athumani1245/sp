import React from 'react';
import Header from "./layout/Header";
import Sidenav from "./layout/Sidenav";

const layout = ({ children }) => {
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

export default layout;