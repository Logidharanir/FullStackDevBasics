import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeTable.css";

/* ────────────────────────────────────────────────────────────── */
/*  Set the API root once.  Works on Vercel (env-var) or locally  */
/* ────────────────────────────────────────────────────────────── */
const API_BASE =
  process.env.REACT_APP_API_URL || "https://dotnetbackend.onrender.com/api";

/* blank template for the modal form */
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
  const [employees, setEmployees] = useState([]);
  const [viewType, setViewType] = useState("table"); // table | card
  const [action, setAction] = useState("");          // CREATE | PUT | ""
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState(emptyEmployee);

  /* ---------------- helpers ---------------- */

  /** GET /Employee */
  const fetchEmployees = () => {
    axios
      .get(`${API_BASE}/Employee`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("GET /Employee failed:", err));
  };

  useEffect(fetchEmployees, []);

  /** update form state on input change */
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /** open modal for create or edit */
  const openAction = (type, emp = null) => {
    setAction(type);                 // "CREATE" or "PUT"
    setSelectedEmployee(emp);
    setFormData(emp ? emp : emptyEmployee);
  };
  /** close the modal */
  const closeModal = () => {
    setAction("");
    setSelectedEmployee(null);
    setFormData(emptyEmployee);
  };

  /** POST /Employee/add */
  const createEmployee = () => {
    axios
      .post(`${API_BASE}/Employee/add`, formData)
      .then((res) => {
        alert("Employee created!");
        setEmployees((prev) => [...prev, res.data]);
        closeModal();
      })
      .catch((err) => alert("Create failed: " + err));
  };

  /** PUT /Employee/{id} */
  const updateEmployee = () => {
    if (!selectedEmployee) return alert("Select employee first");
    axios
      .put(`${API_BASE}/Employee/${selectedEmployee.employeeId}`, formData)
      .then(() => {
        alert("Employee updated!");
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.employeeId === selectedEmployee.employeeId ? formData : emp
          )
        );
        closeModal();
      })
      .catch((err) => alert("Update failed: " + err));
  };

  /** DELETE /Employee/{id} */
  const deleteEmployee = (id) => {
    if (!window.confirm(`Delete employee ${id}?`)) return;
    axios
      .delete(`${API_BASE}/Employee/${id}`)
      .then(() => {
        alert("Employee deleted!");
        setEmployees((prev) => prev.filter((emp) => emp.employeeId !== id));
      })
      .catch((err) => alert("DELETE failed: " + err));
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="employee-container" style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Employee List</h2>

      {/* view toggles + create button */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => setViewType("table")} disabled={viewType === "table"}>
          Table View
        </button>{" "}
        <button onClick={() => setViewType("card")} disabled={viewType === "card"}>
          Card View
        </button>{" "}
        <button onClick={() => openAction("CREATE")} style={{ marginLeft: 20 }}>
          + Create New Employee
        </button>
      </div>

      {/* ---------- Modal form (Create / Update) ---------- */}
      {action && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "#fff",
            padding: 30,
            boxShadow: "0 0 15px rgba(0,0,0,0.35)",
            borderRadius: 10,
            width: 350,
            zIndex: 2000,
          }}
        >
          <h3>{action === "CREATE" ? "Create New Employee" : "Update Employee"}</h3>

          {/* input fields */}
          {[
            { label: "Employee ID", name: "employeeId", type: "number", disabled: action !== "CREATE" },
            { label: "Name",        name: "name",       type: "text"   },
            { label: "Age",         name: "age",        type: "number" },
            { label: "Salary",      name: "salary",     type: "number" },
            { label: "Department ID", name: "departmentId", type: "number" },
            { label: "Manager ID",    name: "managerId",   type: "number" },
          ].map(({ label, name, type, disabled }) => (
            <label key={name} style={{ display: "block", marginTop: 8 }}>
              {label}:<br />
              <input
                type={type}
                name={name}
                value={formData[name] || ""}
                onChange={handleChange}
                disabled={disabled}
                required
              />
            </label>
          ))}

          <div style={{ marginTop: 15 }}>
            <button onClick={() => (action === "CREATE" ? createEmployee() : updateEmployee())}>
              Submit
            </button>
            <button onClick={closeModal} style={{ marginLeft: 10 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------- TABLE VIEW ---------- */}
      {viewType === "table" && (
        <table className="employee-table" cellPadding={10} style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Age</th><th>Salary</th>
              <th>Dept ID</th><th>Mgr ID</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeId}</td><td>{emp.name}</td><td>{emp.age}</td>
                <td>{emp.salary}</td><td>{emp.departmentId}</td>
                <td>{emp.managerId || "N/A"}</td>
                <td>
                  <button onClick={() => openAction("PUT", emp)}>Edit</button>{" "}
                  <button onClick={() => deleteEmployee(emp.employeeId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ---------- CARD VIEW ---------- */}
      {viewType === "card" && (
        <div className="card-container" style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
          {employees.map((emp) => (
            <div
              key={emp.employeeId}
              className="card"
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 15,
                width: 220,
                boxShadow: "0 0 6px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{emp.name}</h3>
              <p><strong>ID:</strong> {emp.employeeId}</p>
              <p><strong>Age:</strong> {emp.age}</p>
              <p><strong>Salary:</strong> ₹{emp.salary}</p>
              <p><strong>Dept ID:</strong> {emp.departmentId}</p>
              <p><strong>Mgr ID:</strong> {emp.managerId || "N/A"}</p>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button onClick={() => openAction("PUT", emp)}>Edit</button>{" "}
                <button onClick={() => deleteEmployee(emp.employeeId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
