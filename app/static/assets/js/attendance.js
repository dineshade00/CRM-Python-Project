const staffData = JSON.parse(localStorage.getItem("staffAttendance") || "{}");

window.onload = () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("staffDate").value = today;
};

function getDateParts(dateStr) {
  const date = new Date(dateStr);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

function submitAttendance(isPresent) {
  const name = document.getElementById("staffFullName").value;
  const dateStr = document.getElementById("staffDate").value;
  if (!name || !dateStr) return alert("Please select name and date");

  const { year, month, day } = getDateParts(dateStr);

  if (!staffData[name]) staffData[name] = {};
  if (!staffData[name][year]) staffData[name][year] = {};
  if (!staffData[name][year][month]) staffData[name][year][month] = {};

  staffData[name][year][month][day] = isPresent;
  localStorage.setItem("staffAttendance", JSON.stringify(staffData));

  alert(
    `${isPresent ? "✔ Present" : "✖ Absent"} marked for ${name} on ${dateStr}`
  );
}

function generateReport() {
  const name = document.getElementById("staffFullName").value;
  const fromDateStr = document.getElementById("fromDate").value;
  const toDateStr = document.getElementById("toDate").value;
  if (!name || !fromDateStr || !toDateStr)
    return alert("Please select all fields");

  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  const tbody = document.getElementById("staffTableBody");
  tbody.innerHTML = "";

  let present = 0,
    absent = 0;

  const row = document.createElement("tr");
  row.innerHTML = `<td>${name}</td><td>${generateMonthGrid(
    name,
    from,
    to,
    (p, a) => {
      present += p;
      absent += a;
    }
  )}</td>`;
  tbody.appendChild(row);

  document.getElementById(
    "countSection"
  ).innerHTML = `<strong>Present:</strong> ${present} | <strong>Absent:</strong> ${absent}`;
}

function generateMonthGrid(name, from, to, countCallback) {
  let html = "";
  const cursor = new Date(from);
  let currentMonth = -1;
  let present = 0,
    absent = 0;

  while (cursor <= to) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const day = cursor.getDate();

    if (month !== currentMonth) {
      currentMonth = month;
      const monthName = cursor.toLocaleString("default", { month: "long" });
      html += `<div class="month-label">${monthName} ${year}</div><div class="day-grid">`;
    }

    if (!staffData[name]) staffData[name] = {};
    if (!staffData[name][year]) staffData[name][year] = {};
    if (!staffData[name][year][month]) staffData[name][year][month] = {};

    const val = staffData[name][year][month][day];
    let checkbox = `<input type="checkbox" class="calendar-checkbox" disabled/>`;

    if (val === true) {
      checkbox = `<input type="checkbox" class="calendar-checkbox green" checked disabled/>`;
      present++;
    } else if (val === false) {
      checkbox = `<input type="checkbox" class="calendar-checkbox red" checked disabled/>`;
      absent++;
    }

    html += `<label>${checkbox} ${day}</label>`;

    const nextDay = new Date(cursor);
    nextDay.setDate(day + 1);
    if (nextDay.getMonth() !== month || nextDay > to) {
      html += `</div>`;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  countCallback(present, absent);
  return html;
}
