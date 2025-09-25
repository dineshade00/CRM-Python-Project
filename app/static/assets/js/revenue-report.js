// Set max date to today for both date inputs
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("fromDate").setAttribute("max", today);
  document.getElementById("toDate").setAttribute("max", today);

  updateRevenueCards(); // update dashboard cards on load
});

function showReportTable() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const container = document.getElementById("reportTableContainer");
  const tableBody = document.querySelector("#datatable tbody");

  if (!fromDate || !toDate) {
    alert("Please select both From Date and To Date.");
    return;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  const members = JSON.parse(localStorage.getItem("members")) || [];

  const filteredMembers = members.filter((member) => {
    const joinDate = new Date(member.joining_date);
    return joinDate >= from && joinDate <= to;
  });

  tableBody.innerHTML = "";

  filteredMembers.forEach((member) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>#CA-${String(member.id).padStart(5, "0")}</td>
      <td>${member.firstName || ""}</td>
      <td>${member.lastName || ""}</td>
      <td>${member.membership_type || ""}</td>
      <td>₹${member.amount_paid || "0"}</td>
      <td>${member.joining_date || "N/A"}</td>
    `;

    tableBody.appendChild(row);
  });

  container.style.display = "block";

  if ($.fn.DataTable.isDataTable("#datatable")) {
    $("#datatable").DataTable().destroy();
  }

  $("#datatable").DataTable({
    responsive: true,
    paging: false,
    searching: false,
    info: false,
    lengthChange: false,
    ordering: false,
  });
}

function printReport() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  if (!fromDate || !toDate) {
    alert("Please select both From Date and To Date.");
    return;
  }

  if ($.fn.DataTable.isDataTable("#datatable")) {
    $("#datatable").DataTable().destroy();
  }

  const originalTable = document.getElementById("datatable");
  const tableClone = originalTable.cloneNode(true);

  const style = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2 { margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      th, td { border: 1px solid #666; padding: 6px; font-size: 12px; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      .no-print { display: none; }
    </style>`;

  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>Revenue Report</title>");
  printWindow.document.write(style);
  printWindow.document.write("</head><body>");
  printWindow.document.write(`<h2>Revenue Report</h2>`);
  printWindow.document.write(
    `<p><strong>From:</strong> ${fromDate} &nbsp;&nbsp; <strong>To:</strong> ${toDate}</p>`
  );
  printWindow.document.write(tableClone.outerHTML);
  printWindow.document.write("</body></html>");
  printWindow.document.close();

  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    $("#datatable").DataTable({
      responsive: true,
      paging: false,
      searching: false,
      info: false,
      lengthChange: false,
      ordering: false,
    });
  };
}

// Dynamically update revenue cards using plan durations
function updateRevenueCards() {
  const members = JSON.parse(localStorage.getItem("members")) || [];
  const plans = JSON.parse(localStorage.getItem("plans")) || [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalRevenue = 0;
  let monthlyRecurring = 0;
  let newMembers = 0;

  members.forEach((member) => {
    const amount = parseFloat(member.amount_paid || 0);
    totalRevenue += amount;

    // Match membership plan type to get duration
    const matchedPlan = plans.find(
      (plan) =>
        plan.type &&
        member.membership_type &&
        plan.type.toLowerCase() === member.membership_type.toLowerCase()
    );

    if (
      matchedPlan &&
      matchedPlan.duration &&
      matchedPlan.duration.toLowerCase().includes("1 month")
    ) {
      monthlyRecurring += amount;
    }

    if (member.joining_date) {
      const joinDate = new Date(member.joining_date);
      if (
        joinDate.getMonth() === currentMonth &&
        joinDate.getFullYear() === currentYear
      ) {
        newMembers++;
      }
    }
  });

  const avgRevenue =
    members.length > 0 ? (totalRevenue / members.length).toFixed(2) : 0;

  document.getElementById("totalRevenueValue").innerText = `₹${totalRevenue}`;
  document.getElementById(
    "monthlyRecurringValue"
  ).innerText = `₹${monthlyRecurring}`;
  document.getElementById("newMembersValue").innerText = newMembers;
  document.getElementById("arpuValue").innerText = `₹${avgRevenue}`;
}
