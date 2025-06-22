import React, { useEffect, useState } from "react";
import axios from "axios";
axios.get(`${API_BASE}/Employee`)

function EmployeeTable() {
  const [employees, setEmployees] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || "https://dotnetbackend.onrender.com/api";

  useEffect(() => {
    axios.get(`${API_BASE}/Employee`)
      .then((response) => setEmployees(response.data))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  return (
    <div>
      <h2>Employees</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Dept ID</th>
            <th>Salary</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.employeeId}>
              <td>{emp.employeeId}</td>
              <td>{emp.name}</td>
              <td>{emp.departmentId}</td>
              <td>{emp.salary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
