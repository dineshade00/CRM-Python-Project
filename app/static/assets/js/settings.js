

function showSection(event, sectionId) {
    document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

document.getElementById("createAdminForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("newAdminName").value.trim();
    const email = document.getElementById("newAdminEmail").value.trim();
    const checkboxes = document.querySelectorAll("#createAdminForm input[type='checkbox']");
    let pages = [];
    checkboxes.forEach(cb => { if (cb.checked) pages.push(cb.value); });

    const adminRow = `
      <tr>
        <td>${name}</td>
        <td>${email}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteAdmin(this)">Delete</button>
          <button class="btn btn-sm btn-secondary">Promote to Super</button>
        </td>
      </tr>`;

    const summaryRow = `
      <tr>
        <td>${name}</td>
        <td>${email}</td>
        <td>${pages.join(", ") || 'No Access'}</td>
      </tr>`;

    document.getElementById("adminTableBody").insertAdjacentHTML("beforeend", adminRow);
    document.getElementById("accessSummaryTable").insertAdjacentHTML("beforeend", summaryRow);
    document.getElementById("createAdminForm").reset();
    alert("Admin Created with Access!");
});

function deleteAdmin(btn) {
    if (confirm("Are you sure to delete this admin?")) {
        btn.closest("tr").remove();
    }
}
