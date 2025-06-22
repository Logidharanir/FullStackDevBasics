/*  src/Components/EmployeeTable.js  */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeTable.css";

/* API base (Vercel env or fallback) */
const API_BASE =
  (process.env.REACT_APP_API_URL || "https://dotnetbackend.onrender.com/api")
    .replace(/\/+$/, ""); // remove trailing slashes

/* blank form template */
const emptyEmployee = {
  employeeId: "",
  name: "",
  age: "",
  salary: "",
  departmentId: "",
  managerId: "",
};

export default function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [viewType, setViewType] = useState("table"); // "table" | "card"
  const [action, setAction] = useState(""); // "CREATE" | "PUT"
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyEmployee);

  /* ⏳ retry-fetch logic for slow backend wakeup */
  useEffect(() => {
    const tryFetch = () => {
      axios.get(`${API_BASE}/Employee`)
        .then((res) => setEmployees(res.data))
        .catch((err) => {
          console.log("Retrying in 2s... (Backend may be sleeping)", err);
          setTimeout(tryFetch, 2000);
        });
    };
    tryFetch();
  }, []);

  const refetch = () => {
    axios.get(`${API_BASE}/Employee`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("GET /Employee failed:", err));
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const openModal = (kind, emp = null) => {
    setAction(kind); // CREATE or PUT
    setSelected(emp);
    setFormData(emp ?? emptyEmployee);
  };

  const closeModal = () => {
    setAction("");
    setSelected(null);
    setFormData(emptyEmployee);
  };

  const createEmployee = () => {
    axios.post(`${API_BASE}/Employee/add`, formData)
      .then(() => {
        alert("Employee added!");
        refetch();
        closeModal();
      })
      .catch((err) => alert("Error creating employee: " + err));
  };

  const updateEmployee = () => {
    axios.put(`${API_BASE}/Employee/${selected.employeeId}`, formData)
      .then(() => {
        alert("Employee updated!");
        refetch();
        closeModal();
      })
      .catch((err) => alert("Error updating employee: " + err));
  };

  const deleteEmployee = (id) => {
    if (!window.confirm(`Are you sure to delete employee ${id}?`)) return;
    axios.delete(`${API_BASE}/Employee/${id}`)
      .then(() => {
        alert("Employee deleted!");
        refetch();
      })
      .catch((err) => alert("Error deleting employee: " + err));
  };

  return (
    <div className="employee-container">
      <h2>Employee List</h2>

      {/* view toggle */}
      <div className="view-toggle">
        <button disabled={viewType === "table"} onClick={() => setViewType("table")}>Table</button>
        <button disabled={viewType === "card"} onClick={() => setViewType("card")}>Card</button>
        <button onClick={() => openModal("CREATE")} style={{ marginLeft: 20 }}>
          + Create
        </button>
      </div>

      {/* modal form */}
      {action && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{action === "CREATE" ? "Create Employee" : "Edit Employee"}</h3>
            {[
              { label: "ID", name: "employeeId", type: "number", disabled: action !== "CREATE" },
              { label: "Name", name: "name", type: "text" },
              { label: "Age", name: "age", type: "number" },
              { label: "Salary", name: "salary", type: "number" },
              { label: "Department ID", name: "departmentId", type: "number" },
              { label: "Manager ID", name: "managerId", type: "number" },
            ].map(({ label, name, type, disabled }) => (
              <label key={name}>
                {label}:<br />
                <input
                  type={type}
                  name={name}
                  value={formData[name] ?? ""}
                  onChange={handleChange}
                  disabled={disabled}
                  required
                />
              </label>
            ))}

            <div style={{ marginTop: 15 }}>
              <button onClick={action === "CREATE" ? createEmployee : updateEmployee}>Submit</button>
              <button onClick={closeModal} style={{ marginLeft: 10 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* table view */}
      {viewType === "table" && (
        <table className="employee-table" cellPadding={10}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Age</th><th>Salary</th>
              <th>Dept</th><th>Mgr</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeId}</td><td>{emp.name}</td><td>{emp.age}</td>
                <td>{emp.salary}</td><td>{emp.departmentId}</td>
                <td>{emp.managerId ?? "—"}</td>
                <td>
                  <button onClick={() => openModal("PUT", emp)}>Edit</button>
                  <button onClick={() => deleteEmployee(emp.employeeId)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* card view */}
      {viewType === "card" && (
        <div className="card-container">
          {employees.map((emp) => (
            <div key={emp.employeeId} className="card">
              <h3>{emp.name}</h3>
              <p><b>ID:</b> {emp.employeeId}</p>
              <p><b>Age:</b> {emp.age}</p>
              <p><b>Salary:</b> ₹{emp.salary}</p>
              <p><b>Dept:</b> {emp.departmentId}</p>
              <p><b>Mgr:</b> {emp.managerId ?? "—"}</p>
              <div className="button-group">
                <button onClick={() => openModal("PUT", emp)}>Edit</button>
                <button onClick={() => deleteEmployee(emp.employeeId)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
