$(document).ready(function () {
  // Unified icon set for all DataTables instances
  const paginateIcons = {
    first: "<i class='mdi mdi-chevron-double-left'></i>",
    previous: "<i class='mdi mdi-chevron-left'></i>",
    next: "<i class='mdi mdi-chevron-right'></i>",
    last: "<i class='mdi mdi-chevron-double-right'></i>",
  };

  // #datatable
  $("#datatable").DataTable({
    language: { paginate: paginateIcons },
    drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination");
    },
  });

  $("#scroll-sidebar-datatable").DataTable({
    scrollY: "350px",
    scrollCollapse: !0,
    paging: !0,
    language: {
      paginate: {
        previous: "<i class='mdi mdi-chevron-left'>",
        next: "<i class='mdi mdi-chevron-right'>",
      },
    },
    drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination");
    },
  }),
    $("#alternative-page-datatable").DataTable({
      pagingType: "full_numbers",
      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination"),
          $(".dataTables_length select").addClass("form-select form-select-sm");
      },
    }),
    $("#datatable-1").DataTable({
      responsive: !0,
      lengthMenu: [
        [5, 10, 25, 50, -1],
        [5, 10, 25, 50, "All"],
      ],
    }),
    $(".dataTables_length select").addClass("form-select form-select-sm");
});

// <!-- =================== CUSTOM SCRIPTS (UPDATED) =================== -->
// <!-- 1️⃣  Bootstrap validation (unchanged) -->

(() => {
  "use strict";
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

/*  <!-- 2️⃣  Helpers to compute & refresh STATUS column and to show SUCCESS messages -->
 */
/* ------------------------------------------------------------------
           ♻️  STATUS CALCULATION
           ------------------------------------------------------------------ */
function parseDateTimeCell(cellText) {
  // Replace NBSPs and weird figure‑dash with normal chars, collapse whitespace
  const cleaned = cellText
    .replace(/\u00A0/g, " ")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const [datePart, timePart] = cleaned.split(" ");
  if (!datePart || !timePart) return null;
  return new Date(`${datePart}T${timePart}`);
}

function updateStatus($row) {
  const $td = $row.children("td");
  const start = parseDateTimeCell($td.eq(3).text());
  if (!start || isNaN(start.valueOf())) return; // malformed

  // Duration column e.g. "45 min" (NBSP)
  const durationMinutes =
    parseInt($td.eq(4).text().replace(/\D/g, ""), 10) || 0;
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const now = new Date();

  let status = "Upcoming";
  let badge = "success";
  if (now >= start && now <= end) {
    status = "Ongoing";
    badge = "info";
  } else if (now > end) {
    status = "Completed";
    badge = "secondary";
  }

  $td.eq(6).html(`<span class="badge bg-${badge}">${status}</span>`);
}

function updateAllStatuses($table) {
  $table.find("tbody tr").each(function () {
    updateStatus($(this));
  });
}

/* ------------------------------------------------------------------
           ✅  SUCCESS MESSAGE HELPER  (🔄 RE‑IMPLEMENTED)
           ------------------------------------------------------------------ */
function showSuccess(message) {
  // Build the modal on‑the‑fly the first time it’s needed
  let $modal = $("#successModal");
  if (!$modal.length) {
    $modal = $(`
      <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content text-center border-0">
            <div class="modal-body p-5">
              <!-- ✅  ADDED mx-auto SO THE ICON STAYS EXACTLY IN THE CENTRE -->
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                style="width:120px;height:120px;border:4px solid #d6eed6;"
              >
                <i class="mdi mdi-check" style="font-size:64px;color:#28a745;"></i>
              </div>

              <h3 class="fw-semibold mb-2">Success</h3>
              <p id="successModalMsg" class="text-muted mb-4"></p>
              <button
                type="button"
                class="btn btn-success px-5"
                data-bs-dismiss="modal"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    `).appendTo("body");
  }

  // Inject the dynamic message text and show the modal
  $modal.find("#successModalMsg").text(message);
  const bsModal = new bootstrap.Modal($modal[0]);
  bsModal.show();
}

/*  <!-- 3️⃣  MAIN OFFLINE‑SESSION LOGIC (enhanced) --> */

/* ------------------------------------------------------------------
           Offline‑session form ⇆ table logic – ENHANCED VERSION
           ------------------------------------------------------------------ */
$(function () {
  // Grab the DataTable instance (initialised elsewhere by template)
  let dt;
  if ($.fn.DataTable.isDataTable("#alternative-page-datatable")) {
    dt = $("#alternative-page-datatable").DataTable();
  } else {
    dt = $("#alternative-page-datatable").DataTable({ responsive: true });
  }

  // Refresh statuses right away
  updateAllStatuses($("#alternative-page-datatable"));

  // Add helper classes to the original action buttons for delegation
  $("#alternative-page-datatable tbody")
    .find("button.btn-primary")
    .addClass("edit-btn")
    .end()
    .find("button.btn-danger")
    .addClass("delete-btn");

  // Cache form elements
  const $form = $(".needs-validation").eq(0);
  const $submitBtn = $form.find("button[type='submit']");
  const $titleElem = $form.closest(".card").find(".card-header h4.card-title");

  let editMode = false;
  let $editingRow = null;

  /* --------------------------------------------------------------
             FORM SUBMIT  (Add ➜ New / Edit ➜ Update)
             -------------------------------------------------------------- */
  $form.on("submit", function (e) {
    e.preventDefault();
    if (!this.checkValidity()) return; // Let Bootstrap show errors

    // Collect values
    const sessionName = $("#validationTooltip01").val().trim();
    const trainerName = $("#validationTooltip02").val().trim();
    const rawDateTime = $("#validationTooltip04").val(); // yyyy‑mm‑ddThh:mm
    const dateTimeDisp = rawDateTime.replace("T", " ");
    const location = $("#validationTooltipUsername").val().trim();
    const participants = $("#validationTooltip03").val().trim();
    const duration = $("#duration").val().trim();

    // HTML fragments
    const actionBtns =
      '<button class="btn btn-sm btn-primary edit-btn">Edit</button> ' +
      '<button class="btn btn-sm btn-danger delete-btn">Delete</button>';
    const trainerLink = `<a href="#" class="trainer-link text-dark" data-name="${trainerName}" style="text-decoration:none">${trainerName}</a>`;

    if (editMode && $editingRow) {
      // UPDATE existing row
      const $td = $editingRow.children("td");
      $td.eq(0).text(sessionName);
      $td.eq(1).html(trainerLink);
      $td.eq(2).text(location);
      $td.eq(3).text(dateTimeDisp);
      $td.eq(4).text(`${duration} min`);
      $td.eq(5).text(participants);
      dt.row($editingRow).invalidate().draw(false);
      updateStatus($editingRow);
      showSuccess("Session Updated Successfully...");
    } else {
      // ADD new row
      dt.row
        .add([
          sessionName,
          trainerLink,
          location,
          dateTimeDisp,
          `${duration} min`,
          participants,
          '<span class="badge bg-success">Upcoming</span>',
          actionBtns,
        ])
        .draw(false);
      // Update status for the newly inserted row (last one in DT order before any sorting)
      const newRow = $(dt.row(0).node()).closest("tbody tr").last();
      updateStatus(newRow);
      showSuccess("New Offline Session Added Successfully...");
    }

    // Reset form back to ADD mode
    resetForm();
  });

  /* --------------------------------------------------------------
             DELETE (delegated)
             -------------------------------------------------------------- */
  $("#alternative-page-datatable tbody").on(
    "click",
    ".delete-btn",
    function () {
      const $row = $(this).closest("tr");
      dt.row($row).remove().draw(false);
      if ($editingRow && $row.is($editingRow)) {
        resetForm();
      }
    }
  );

  /* --------------------------------------------------------------
             EDIT (delegated – pre‑fill form)
             -------------------------------------------------------------- */
  $("#alternative-page-datatable tbody").on("click", ".edit-btn", function () {
    $editingRow = $(this).closest("tr");
    const $td = $editingRow.children("td");

    $("#validationTooltip01").val($td.eq(0).text().trim()); // Session Name
    $("#validationTooltip02").val($td.eq(1).text().trim()); // Trainer Name
    $("#validationTooltipUsername").val($td.eq(2).text().trim()); // Location / Zone

    const dtLocalVal = $td
      .eq(3)
      .text()
      .replace(/\u00A0/g, " ")
      .trim()
      .replace(" ", "T");
    $("#validationTooltip04").val(dtLocalVal); // Date & Time (datetime‑local input)

    const dur = parseInt($td.eq(4).text().replace(/\D/g, ""), 10) || "";
    $("#duration").val(dur); // Duration

    $("#validationTooltip03").val($td.eq(5).text().trim()); // Participants

    // Switch UI to EDIT mode
    $titleElem.text("Edit Offline Session");
    $submitBtn.text("Update");
    editMode = true;
  });

  /* --------------------------------------------------------------
             Helper ➜ Reset form to ADD mode
             -------------------------------------------------------------- */
  function resetForm() {
    editMode = false;
    $editingRow = null;
    $form[0].reset();
    $form.removeClass("was-validated");
    $titleElem.text("Add New Offline Session");
    $submitBtn.text("Submit");
  }
});

/* <!-- ================= END CUSTOM SCRIPTS (UPDATED) ================= --> */

/**
 * offline-session.js
 * ---------------------------------------------------------------
 * Builds the “Today’s Sessions” card grid from the Offline Sessions
 * table and keeps it in sync when the user adds a new session that
 * falls on the current date.
 *
 * Dependencies: jQuery, DataTables, Bootstrap 5, Material Design Icons
 */

$(function () {
  /* -------------------------------------------------- *
   * 1. DataTable initialisation                        *
   * -------------------------------------------------- */
  let table;
  if ($.fn.DataTable.isDataTable("#alternative-page-datatable")) {
    table = $("#alternative-page-datatable").DataTable(); // already initialised
  } else {
    table = $("#alternative-page-datatable").DataTable({
      responsive: true,
      pageLength: 10,
    });
  }

  /* -------------------------------------------------- *
   * 2. Card style palette                              *
   * -------------------------------------------------- */
  const cardStyles = [
    {
      bg: "bg-danger-subtle",
      shape: "assets/images/dashboard/dashboard-shape-1.png",
      avatar: "avatar-label-danger",
      icon: "mdi mdi-run-fast",
      text: "text-danger",
    },
    {
      bg: "bg-success-subtle",
      shape: "assets/images/dashboard/dashboard-shape-2.png",
      avatar: "avatar-label-success",
      icon: "mdi mdi-fire",
      text: "text-success",
    },
    {
      bg: "bg-info-subtle",
      shape: "assets/images/dashboard/dashboard-shape-3.png",
      avatar: "avatar-label-info",
      icon: "mdi mdi-yoga",
      text: "text-info",
    },
    {
      bg: "bg-warning-subtle",
      shape: "assets/images/dashboard/dashboard-shape-2.png",
      avatar: "avatar-label-warning",
      icon: "mdi mdi-weight-lifter",
      text: "text-warning",
    },
    {
      bg: "bg-primary-subtle",
      shape: "assets/images/dashboard/dashboard-shape-1.png",
      avatar: "avatar-label-primary",
      icon: "mdi mdi-star",
      text: "text-primary",
    },
  ];

  /* -------------------------------------------------- *
   * 3. Helper utilities                                *
   * -------------------------------------------------- */
  const NBSP_HYPHEN = /[\u00A0\u2010\u2011]/g; // &nbsp; and non‑std hyphens

  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const normaliseDatePart = (s) => s.replace(NBSP_HYPHEN, "-");

  // Build one card (wrapped in a col‑element) using a style object
  const buildCard = ({ title, trainer, location, dateObj, timeStr }, style) => {
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return $(`
      <div class="col-xl-4">
        <div class="card ${style.bg}" style="
          background-repeat:no-repeat;
          background-position:bottom center;
          background-image:url('${style.shape}');
        ">
          <div class="card-body">
            <div class="d-flex">
              <div class="avatar avatar-sm ${style.avatar}">
                <i class="${style.icon} mt-1"></i>
              </div>
              <div class="ms-3">
                <p class="${style.text} mb-1">${title}</p>
                <h5 class="mb-0">Trainer:<br> ${trainer}</h5>
              </div>
            </div>
            <div class="mt-3 mb-2">
              <p class="mb-0"><strong>Date:</strong> ${dateStr}</p>
              <p class="mb-0"><strong>Time:</strong> ${timeStr}</p>
              <p class="mb-0"><strong>Place:</strong> ${location}</p>
            </div>
          </div>
        </div>
      </div>
    `);
  };

  /* -------------------------------------------------- *
   * 4. Render / refresh the “Today’s Sessions” grid    *
   * -------------------------------------------------- */
  function renderTodayCards() {
    const $wrap = $("#todays-session-cards").empty();
    const todayKey = +startOfDay(new Date());
    let row,
      styleIndex = 0,
      foundAny = false;

    table.rows().every(function () {
      const data = this.data();

      // Extract and sanitize the date‑time cell
      const dateCell = $("<div>")
        .html(data[3])
        .text()
        .trim()
        .replace(/\s+/g, " ");
      if (!dateCell) return;

      const [rawDate, rawTime] = dateCell.split(" ");
      const thisDate = new Date(normaliseDatePart(rawDate));
      if (+startOfDay(thisDate) !== todayKey) return;

      foundAny = true;

      const session = {
        title: $("<div>").html(data[0]).text().trim(),
        trainer: $("<div>").html(data[1]).text().trim(),
        location: $("<div>").html(data[2]).text().trim(),
        dateObj: thisDate,
        timeStr: rawTime,
      };

      if (!row || row.children().length === 3) {
        row = $('<div class="row mb-3"></div>');
        $wrap.append(row);
      }

      const style = cardStyles[styleIndex % cardStyles.length];
      styleIndex += 1;
      row.append(buildCard(session, style));
    });

    // ✅ Show fallback message if no sessions found for today
    if (!foundAny) {
      $wrap.append(`
      <div class="col-12">
        <div class="alert alert-danger text-center mb-0" role="alert">
          There are no session for today...
        </div>
      </div>
    `);
    }
  }

  // Initial card build
  renderTodayCards();

  /* -------------------------------------------------- *
   * 5. “Add New Offline Session” form handler          *
   * -------------------------------------------------- */
  $(".needs-validation").on("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return;
    }

    // Collect form values
    const title = $("#validationTooltip01").val().trim();
    const trainer = $("#validationTooltip02").val().trim();
    const dateTimeISO = $("#validationTooltip04").val().trim();
    const location = $("#validationTooltipUsername").val().trim();
    const participants = $("#validationTooltip03").val().trim();
    const duration = $("#duration").val().trim();

    const dateObj = new Date(dateTimeISO);
    const datePart = dateObj.toISOString().slice(0, 10);
    const timePart = dateObj.toTimeString().slice(0, 5);

    // Add the new row to DataTable
    table.row
      .add([
        title,
        trainer,
        location,
        `${datePart} ${timePart}`,
        `${duration} min`,
        participants,
        '<span class="badge bg-success">Upcoming</span>',
        '<button class="btn btn-sm btn-primary">Edit</button> <button class="btn btn-sm btn-danger">Delete</button>',
      ])
      .draw(false);

    // Reset form state
    this.reset();
    this.classList.remove("was-validated");

    // Rebuild cards if the new session is today
    if (+startOfDay(dateObj) === +startOfDay(new Date())) {
      renderTodayCards();
    }
  });

  /* -------------------------------------------------- *
   * 6. Keep cards in sync with table redraws           *
   * -------------------------------------------------- */
  table.on("draw", renderTodayCards);
});
