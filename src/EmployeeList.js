import React, { useEffect, useState } from "react";
import axios from "axios";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  // ✅ pick API base url from env var, or fall back to local dev
  const API_BASE =
    process.env.REACT_APP_API_URL || "https://dotnetbackend.onrender.com/api";

  useEffect(() => {
    axios
      .get(`${API_BASE}/Employee`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, [API_BASE]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Employee List</h2>

      {employees.length === 0 ? (
        <p>No data found</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department&nbsp;ID</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeId}</td>
                <td>{emp.name}</td>
                <td>{emp.departmentId}</td>
                <td>{emp.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeList;
