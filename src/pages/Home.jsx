import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import Layout from "../components/Layout";

function Home() {
    usePageTitle('Home');
    return (
        <Layout>
            <div className="main-content">
                <h1>Home</h1>
            </div>
        </Layout>
    )
}

export default Home;