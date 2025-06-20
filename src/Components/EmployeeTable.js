import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeTable.css";

const emptyEmployee = {
  employeeId: "",
  name: "",
  age: "",
  salary: "",
  departmentId: "",
  managerId: "",
};

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [viewType, setViewType] = useState("table");
  const [action, setAction] = useState(""); // 'PUT' or 'CREATE'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState(emptyEmployee);

  // Fetch all employees
  const fetchEmployees = () => {
    axios
      .get("http://localhost:5086/api/Employee")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open modal for create or update
  const openAction = (actionType, employee = null) => {
    setAction(actionType);
    setSelectedEmployee(employee);
    if (employee) setFormData(employee);
    else setFormData(emptyEmployee);
  };

  const closeModal = () => {
    setAction("");
    setSelectedEmployee(null);
    setFormData(emptyEmployee);
  };

  // Create new employee
  const createEmployee = () => {
    axios
      .post("http://localhost:5086/api/Employee/add", formData)
      .then((res) => {
        alert("Employee created!");
        setEmployees((prev) => [...prev, res.data]);
        closeModal();
      })
      .catch((err) => alert("Create failed: " + err));
  };

  // Update existing employee (PUT)
  const updateEmployee = () => {
    if (!selectedEmployee) return alert("Select employee first");
    axios
      .put(`http://localhost:5086/api/Employee/${selectedEmployee.employeeId}`, formData)
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

  // Delete employee
  const deleteEmployee = (id) => {
    if (window.confirm(`Are you sure you want to delete employee ${id}?`)) {
      axios
        .delete(`http://localhost:5086/api/Employee/${id}`)
        .then(() => {
          alert("Employee deleted!");
          setEmployees((prev) => prev.filter((emp) => emp.employeeId !== id));
        })
        .catch((error) => alert("DELETE failed: " + error));
    }
  };

  return (
    <div className="employee-container" style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Employee List</h2>

      {/* View toggle buttons */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => setViewType("table")} disabled={viewType === "table"}>
          Table View
        </button>{" "}
        <button onClick={() => setViewType("card")} disabled={viewType === "card"}>
          Card View
        </button>{" "}
        {/* Create button always visible */}
        <button onClick={() => openAction("CREATE")} style={{ marginLeft: 20 }}>
          + Create New Employee
        </button>
      </div>

      {/* Modal form */}
      {action && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "white",
            padding: 30,
            boxShadow: "0 0 15px rgba(0,0,0,0.35)",
            zIndex: 2000,
            borderRadius: 10,
            width: 350,
          }}
        >
          <h3>{action === "CREATE" ? "Create New Employee" : "Update Employee"}</h3>

          <label>
            Employee ID:<br />
            <input
              type="number"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              disabled={action !== "CREATE"} // ID editable only on create
              required
            />
          </label>
          <br />
          <label>
            Name:<br />
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Age:<br />
            <input
              type="number"
              name="age"
              value={formData.age || ""}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Salary:<br />
            <input
              type="number"
              name="salary"
              value={formData.salary || ""}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Department ID:<br />
            <input
              type="number"
              name="departmentId"
              value={formData.departmentId || ""}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Manager ID:<br />
            <input
              type="number"
              name="managerId"
              value={formData.managerId || ""}
              onChange={handleChange}
            />
          </label>
          <br />
          <br />
          <button
            onClick={() => {
              if (action === "CREATE") createEmployee();
              else if (action === "PUT") updateEmployee();
            }}
          >
            Submit
          </button>
          <button onClick={closeModal} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      )}

      {/* Table View */}
      {viewType === "table" && (
        <table
          border="1"
          cellPadding="10"
          cellSpacing="0"
          className="employee-table"
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Salary</th>
              <th>Department ID</th>
              <th>Manager ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeId}</td>
                <td>{emp.name}</td>
                <td>{emp.age}</td>
                <td>{emp.salary}</td>
                <td>{emp.departmentId}</td>
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

      {/* Card View */}
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
              <p>
                <strong>Employee ID:</strong> {emp.employeeId}
              </p>
              <p>
                <strong>Age:</strong> {emp.age}
              </p>
              <p>
                <strong>Salary:</strong> ₹{emp.salary}
              </p>
              <p>
                <strong>Department ID:</strong> {emp.departmentId}
              </p>
              <p>
                <strong>Manager ID:</strong> {emp.managerId || "N/A"}
              </p>
              <div className="button-group" style={{ textAlign: "center", marginTop: 10 }}>
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
