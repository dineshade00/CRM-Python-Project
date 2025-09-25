
      document.addEventListener("DOMContentLoaded", function () {
        // Select all delete buttons
        const deleteButtons = document.querySelectorAll(".btn-danger");

        deleteButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const row = this.closest("tr");
            if (row) {
              row.remove();
            }
          });
        });
      });
 

      window.addEventListener("DOMContentLoaded", function () {
        // Add any new staff from localStorage (if available)
        const staffList = JSON.parse(localStorage.getItem("staffList") || "[]");
        const tbody = document.querySelector(
          "#datatable-col-visiblility tbody"
        );

        staffList.forEach((staff) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
        <td>${staff.staffId}</td>
        <td>
          <img src="${staff.photo || "assets/images/default.png"}" 
               alt="${staff.firstName} ${staff.lastName}"
               class="rounded-circle" width="50" height="50" />
        </td>
        <td>${staff.firstName}</td>
        <td>${staff.lastName}</td>
        <td>${staff.contact}</td>
        <td>${staff.email}</td>
        <td>${staff.jobPost}</td>
        <td>
          <button class="btn btn-info btn-sm me-1">
            <a href="manage-staff.html" class="text-white" onclick='setEditStaffData(${JSON.stringify(
              staff
            )})'>Edit</a>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteStaff('${
            staff.staffId
          }')">Delete</button>
        </td>
      `;
          tbody.appendChild(tr);
        });

        // Attach delete functionality to new buttons
        const deleteButtons = document.querySelectorAll(".btn-danger");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const row = this.closest("tr");
            if (row) {
              row.remove();
            }
          });
        });
      });

      function setEditStaffData(data) {
        localStorage.setItem("editStaffData", JSON.stringify(data));
      }

      function deleteStaff(id) {
        if (confirm("Are you sure you want to delete this staff?")) {
          let staffList = JSON.parse(localStorage.getItem("staffList") || "[]");
          staffList = staffList.filter((s) => s.staffId !== id);
          localStorage.setItem("staffList", JSON.stringify(staffList));
          location.reload();
        }
      }
 
