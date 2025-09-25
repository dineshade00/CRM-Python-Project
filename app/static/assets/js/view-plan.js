function renderTable() {
  const data = JSON.parse(localStorage.getItem("memberships") || "[]");
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  data.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${capitalize(entry.type)}</td>
        <td>₹${entry.amount}</td>
        <td>${entry.duration || "-"}</td>
        <td>${entry.offer}</td>
        <td class="d-flex gap-2 justify-content-center flex-wrap">
          <a href="manage-plan.html?index=${index}" class="btn btn-sm btn-primary">Edit</a>
          <button class="btn btn-sm btn-danger" onclick="deleteRow(${index})">Delete</button>
        </td>
      `;
    table.appendChild(row);
  });
}

function deleteRow(index) {
  const data = JSON.parse(localStorage.getItem("memberships") || "[]");
  const deletedPlan = data[index];

  if (deletedPlan) {
    // Remove from memberships list
    data.splice(index, 1);
    localStorage.setItem("memberships", JSON.stringify(data));

    // Remove from customPlans (used in dropdown)
    const customPlans = JSON.parse(localStorage.getItem("customPlans") || "{}");
    delete customPlans[deletedPlan.type.toLowerCase()];
    localStorage.setItem("customPlans", JSON.stringify(customPlans));

    // Optional: Reload add-new-plan dropdown if on that page
    if (window.location.href.includes("add-new-plan.html")) {
      window.location.reload(); // Or trigger dropdown re-population function
    }
  }

  renderTable();
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

window.onload = renderTable;
