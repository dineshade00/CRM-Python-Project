function showHistory(tabId) {
  document.getElementById("staffHistory").style.display = "none";
  document.getElementById("memberHistory").style.display = "none";
  document.getElementById(tabId).style.display = "block";

  const buttons = document.querySelectorAll("#historyTabs .nav-link");
  buttons.forEach((btn) => btn.classList.remove("active"));

  if (tabId === "staffHistory") buttons[0].classList.add("active");
  else buttons[1].classList.add("active");
}

const staffData = [
  {
    name: "Shubham Khodke",
    id: "S001",
    role: "Trainer",
    acc: "1234567890",
    bank: "SBI",
    amount: "25000",
    date: "2025-07-01",
    mode: "Bank Transfer",
  },
  {
    name: "Rahul Sharma",
    id: "S002",
    role: "Manager",
    acc: "9876543210",
    bank: "HDFC",
    amount: "35000",
    date: "2025-07-05",
    mode: "UPI",
  },
];

const memberData = [
  {
    name: "Ravi Verma",
    id: "M001",
    type: "Gold",
    amount: "5000",
    date: "2025-07-10",
  },
  {
    name: "Amit Joshi",
    id: "M002",
    type: "Platinum",
    amount: "8000",
    date: "2025-07-15",
  },
];

function loadHistoryData() {
  const staffBody = document.getElementById("staffHistoryBody");
  staffBody.innerHTML = "";
  staffData.forEach((item) => {
    const row = `
      <tr>
        <td>${item.name}</td>
        <td>${item.id}</td>
        <td>${item.role}</td>
        <td>${item.acc}</td>
        <td>${item.bank}</td>
        <td>₹${item.amount}</td>
        <td>${item.date}</td>
        <td>${item.mode}</td>
        <td class="no-print">
          <button class="btn btn-sm btn-info" onclick='printIndividualStaff(${JSON.stringify(
            item
          )})'>
            🖨️ Print Staff History
          </button>
        </td>
      </tr>
    `;
    staffBody.innerHTML += row;
  });

  const memberBody = document.getElementById("memberHistoryBody");
  memberBody.innerHTML = "";
  memberData.forEach((item) => {
    const row = `
      <tr>
        <td>${item.name}</td>
        <td>${item.id}</td>
        <td>${item.type}</td>
        <td>₹${item.amount}</td>
        <td>${item.date}</td>
        <td class="no-print">
          <button class="btn btn-sm btn-info" onclick='printIndividualMember(${JSON.stringify(
            item
          )})'>
            🖨️ Print Member History
          </button>
        </td>
      </tr>
    `;
    memberBody.innerHTML += row;
  });
}

document.addEventListener("DOMContentLoaded", loadHistoryData);

function printSection(sectionId) {
  const section = document.getElementById(sectionId);
  const printWindow = window.open("", "", "height=600,width=800");
  printWindow.document.write(`
    <html>
    <head>
      <title>Print History</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        body { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        h4 { text-align: center; }
        @media print {
          .no-print, .no-print * {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>${section.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function printIndividualStaff(staff) {
  const html = `
    <h4>STAFF SALARY PAYMENT HISTORY</h4>
    <table>
      <tr><th>Staff Name</th><td>${staff.name}</td></tr>
      <tr><th>Staff ID</th><td>${staff.id}</td></tr>
      <tr><th>Job Role</th><td>${staff.role}</td></tr>
      <tr><th>Account No</th><td>${staff.acc}</td></tr>
      <tr><th>Bank</th><td>${staff.bank}</td></tr>
      <tr><th>Amount (₹)</th><td>${staff.amount}</td></tr>
      <tr><th>Salary Date</th><td>${staff.date}</td></tr>
      <tr><th>Payment Mode</th><td>${staff.mode}</td></tr>
    </table>
  `;
  const printWindow = window.open("", "", "height=600,width=800");
  printWindow.document.write(`
    <html>
    <head>
      <title>Print Staff</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        body { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function printIndividualMember(member) {
  const html = `
    <h4>MEMBER BILL PAYMENT HISTORY</h4>
    <table>
      <tr><th>Member Name</th><td>${member.name}</td></tr>
      <tr><th>Member ID</th><td>${member.id}</td></tr>
      <tr><th>Membership Type</th><td>${member.type}</td></tr>
      <tr><th>Amount (₹)</th><td>${member.amount}</td></tr>
      <tr><th>Billing Date</th><td>${member.date}</td></tr>
    </table>
  `;
  const printWindow = window.open("", "", "height=600,width=800");
  printWindow.document.write(`
    <html>
    <head>
      <title>Print Member</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        body { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
