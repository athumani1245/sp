import React, {useState} from 'react';
import Layout from "../../components/Layout";
import AddProperty from "../../components/forms/AddProperty";



function Properties() {

    const [search, setSearch] = useState("");
    const [tag, setTag] = useState(false);
    const [page, setPage] = useState(1);
    const [properties, setProperties] = useState([]);
    const [showModal, setShowModal] = useState(false);



    return (
        <Layout>
            <div className="border p-4 bg-white">
                <div className="mb-3">
                    <h3 className="fw-bold mb-1">Properties List</h3>
                    <div className="text-muted mb-3" style={{ fontSize: "15px" }}>
                        Lorem ipsum sit amet, consectetur adipiscing elit. Suspendisse
                        varius enim in eros.
                    </div>
                    <div className="d-flex flex-wrap align-items-center mb-2 gap-2">
                        <div className="input-group" style={{ maxWidth: 300 }}>
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="fa fa-search" />
                                        </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ borderLeft: 0 }}
                            />
                        </div>
                        <button
                            className="btn btn-outline-secondary d-flex align-items-center"
                            type="button"
                        >
                            <i className="fa fa-filter me-2" /> Filters
                        </button>
                        <div className="ms-auto">
                            <button
                                className="btn btn-dark d-flex align-items-center"
                                onClick={(e) => setShowModal(true)}
                                type="button"
                            >
                                <i className="fa fa-cube me-2" /> Add New Property
                            </button>
                            <AddProperty/>
                        </div>
                    </div>
                    {tag && (
                        <div className="mb-2">
                                        <span className="badge bg-light text-dark border me-2">
                                            Tag{" "}
                                            <span
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setTag(false)}
                                            >
                                                ×
                                            </span>
                                        </span>
                        </div>
                    )}
                    <div className="text-end small text-muted mb-2">
                        Showing 1–50 of 500
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered align-middle mb-0">
                        <thead className="table-light">
                        <tr>
                            <th>Property Name</th>
                            <th>Address</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Rent per month</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {properties.map((p, idx) => (
                            <tr key={idx}>
                                <td>{p.name}</td>
                                <td>{p.company}</td>
                                <td>{p.location}</td>
                                <td>{p.status}</td>
                                <td>{p.rent}</td>
                                <td>
                                    <a href="#" className="text-decoration-none fw-bold">
                                        View
                                    </a>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                        className="btn btn-light border"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <i className="fa fa-chevron-left me-2" /> Prev
                    </button>
                    <nav>
                        <ul className="pagination mb-0">
                            <li className="page-item active">
                                <span className="page-link">1</span>
                            </li>
                            <li className="page-item">
                                <span className="page-link">2</span>
                            </li>
                            <li className="page-item">
                                <span className="page-link">3</span>
                            </li>
                            <li className="page-item">
                                <span className="page-link">4</span>
                            </li>
                        </ul>
                    </nav>
                    <button
                        className="btn btn-light border"
                        onClick={() => setPage(page + 1)}
                    >
                        Next <i className="fa fa-chevron-right ms-2" />
                    </button>
                </div>
            </div>
        </Layout>
    )
}

export default Properties;