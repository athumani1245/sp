import { NavLink } from "react-router-dom";

function Sidenav(){
    return (
        <nav className="col-md-2 sidebar d-none d-md-block">
            <ul className="nav flex-column">
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="/dashboard">
                        <i className="bi bi-house"></i> Home
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="/properties">
                        <i className="bi bi-building"></i> Properties Management
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-people"></i> Tenants Management
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-cash"></i> Rent Collection & Payments
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-tools"></i> Maintenance Request
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-bar-chart"></i> Report & Analytics
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                             to="#">
                        <i className="bi bi-gear"></i> Settings
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Sidenav;