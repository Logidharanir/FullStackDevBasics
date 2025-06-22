/*  src/Components/EmployeeTable.js  */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeTable.css";
import { API_BASE } from "../api";

/* ——————————————————————————————————————————————— */
/*  1.  API root: Vercel env  → REACT_APP_API_URL        */
/*      local fallback       → Render URL                */
/* ——————————————————————————————————————————————— */
const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, "") ||
  "https://dotnetbackend.onrender.com/api";

/* template for the form */
const emptyEmployee = {
  employeeId: "",
  name: "",
  age: "",
  salary: "",
  departmentId: "",
  managerId: "",
};

const EmployeeTable = () => {
  /* ---------------- state ---------------- */
  const [employees, setEmployees]         = useState([]);
  const [viewType,   setViewType]         = useState("table"); // table | card
  const [action,     setAction]           = useState("");      // "" | CREATE | PUT
  const [selected,   setSelected]         = useState(null);    // current employee
  const [formData,   setFormData]         = useState(emptyEmployee);

  /* ---------------- CRUD helpers ---------------- */

  /* GET /Employee */
  const fetchEmployees = () => {
    axios.get(`${API_BASE}/Employee`)
      .then(res => setEmployees(res.data))
      .catch(err => console.error("GET /Employee failed:", err));
  };
  useEffect(fetchEmployees, []);

  /* handle <input> change */
  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  /* open modal */
  const openModal = (kind, emp = null) => {
    setAction(kind);          // CREATE | PUT
    setSelected(emp);
    setFormData(emp ? emp : emptyEmployee);
  };
  const closeModal = () => {
    setAction("");
    setSelected(null);
    setFormData(emptyEmployee);
  };

  /* POST /Employee/add */
  const createEmployee = () => {
    axios.post(`${API_BASE}/Employee/add`, formData)
      .then(res => {
        setEmployees(prev => [...prev, res.data]);
        closeModal();
      })
      .catch(err => alert("Create failed: " + err));
  };

  /* PUT /Employee/{id} */
  const updateEmployee = () => {
    if (!selected) return alert("Select an employee first");
    axios.put(`${API_BASE}/Employee/${selected.employeeId}`, formData)
      .then(() => {
        setEmployees(prev =>
          prev.map(emp =>
            emp.employeeId === selected.employeeId ? formData : emp
          )
        );
        closeModal();
      })
      .catch(err => alert("Update failed: " + err));
  };

  /* DELETE /Employee/{id} */
  const deleteEmployee = id => {
    if (!window.confirm(`Delete employee ${id}?`)) return;
    axios.delete(`${API_BASE}/Employee/${id}`)
      .then(() => setEmployees(prev => prev.filter(emp => emp.employeeId !== id)))
      .catch(err => alert("DELETE failed: " + err));
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="employee-container" style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Employee List</h2>

      {/* view toggles + create */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button disabled={viewType === "table"} onClick={() => setViewType("table")}>Table</button>{" "}
        <button disabled={viewType === "card"}  onClick={() => setViewType("card")}>Card</button>{" "}
        <button style={{ marginLeft: 20 }} onClick={() => openModal("CREATE")}>
          + Create
        </button>
      </div>

      {/* ─────── modal ─────── */}
      {action && (
        <div className="modal">
          <h3>{action === "CREATE" ? "Create Employee" : "Edit Employee"}</h3>
          {[
            {label:"ID",       name:"employeeId",  type:"number", disabled:action!=="CREATE"},
            {label:"Name",     name:"name",        type:"text"},
            {label:"Age",      name:"age",         type:"number"},
            {label:"Salary",   name:"salary",      type:"number"},
            {label:"Dept ID",  name:"departmentId",type:"number"},
            {label:"Mgr ID",   name:"managerId",   type:"number"},
          ].map(({label,name,type,disabled})=>(
            <label key={name} style={{display:"block",marginTop:8}}>
              {label}:<br/>
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
          <div style={{marginTop:15}}>
            <button onClick={()=>action==="CREATE"?createEmployee():updateEmployee()}>
              Submit
            </button>
            <button onClick={closeModal} style={{marginLeft:10}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ─────── table view ─────── */}
      {viewType==="table" && (
        <table className="employee-table" cellPadding={10} style={{ width:"100%" }}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Age</th><th>Salary</th>
              <th>Dept</th><th>Mgr</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp=>(
              <tr key={emp.employeeId}>
                <td>{emp.employeeId}</td><td>{emp.name}</td><td>{emp.age}</td>
                <td>{emp.salary}</td><td>{emp.departmentId}</td>
                <td>{emp.managerId ?? "—"}</td>
                <td>
                  <button onClick={()=>openModal("PUT",emp)}>Edit</button>{" "}
                  <button onClick={()=>deleteEmployee(emp.employeeId)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ─────── card view ─────── */}
      {viewType==="card" && (
        <div className="card-container">
          {employees.map(emp=>(
            <div key={emp.employeeId} className="card">
              <h3>{emp.name}</h3>
              <p><b>ID:</b> {emp.employeeId}</p>
              <p><b>Age:</b> {emp.age}</p>
              <p><b>Salary:</b> ₹{emp.salary}</p>
              <p><b>Dept:</b> {emp.departmentId}</p>
              <p><b>Mgr:</b> {emp.managerId ?? "—"}</p>
              <div style={{textAlign:"center",marginTop:10}}>
                <button onClick={()=>openModal("PUT",emp)}>Edit</button>{" "}
                <button onClick={()=>deleteEmployee(emp.employeeId)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
