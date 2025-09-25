      const toggleFormBtn = document.getElementById("toggleFormBtn");
      const addForm = document.getElementById("addEquipmentForm");
      const tabContent = document.querySelector(".tab-content");
      const detailCard = document.getElementById("equipmentDetailCard");
      const navTabs = document.querySelector(".nav-tabs");
      const form = document.querySelector("#addEquipmentForm form");
      const tableBody = document.querySelector("#all table tbody");

      // Toggle form and pre-fill fields
      toggleFormBtn.addEventListener("click", function () {
        const isVisible = addForm.style.display === "block";
        addForm.style.display = isVisible ? "none" : "block";
        tabContent.style.display = isVisible ? "block" : "none";
        navTabs.style.display = isVisible ? "flex" : "none";
        detailCard.style.display = "none";

        if (!isVisible) {
          // Pre-fill form values
          const inputs = form.querySelectorAll("input, select");
          inputs.forEach((input) => {
            if (input.type === "text")
              input.value = "Sample " + input.placeholder;
            if (input.type === "date")
              input.value = new Date().toISOString().split("T")[0];
            if (input.tagName === "SELECT") input.selectedIndex = 1;
          });
        }
      });

      // Back to main page
      function backToMainPage() {
        detailCard.style.display = "none";
        tabContent.style.display = "block";
        navTabs.style.display = "flex";
        addForm.style.display = "none";
      }

      // Bind Show Details in All tab
      function bindShowDetails() {
        document.querySelectorAll(".show-details").forEach((btn) => {
          btn.onclick = function () {
            const row = btn.closest("tr");
            const cells = row.querySelectorAll("td");

            document.getElementById("detailId").textContent =
              cells[0].textContent;
            document.getElementById("detailImage").src =
              cells[1].querySelector("img").src;
            document.getElementById("detailName").textContent =
              cells[2].textContent;
            document.getElementById("detailCategory").textContent =
              cells[3].textContent;
            document.getElementById("detailBrand").textContent =
              cells[4].textContent;
            document.getElementById("detailDate").textContent =
              cells[5].textContent;
            document.getElementById("detailStatus").textContent =
              cells[6].textContent;
            document.getElementById("detailLocation").textContent =
              cells[7].textContent;

            detailCard.style.display = "block";
            tabContent.style.display = "none";
            navTabs.style.display = "none";
            addForm.style.display = "none";
          };
        });
      }
      bindShowDetails();

      // Save form data to "All" tab
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        let isValid = true;
        const inputs = form.querySelectorAll("input, select");
        inputs.forEach((input) => {
          if (input.value.trim() === "") {
            input.classList.add("is-invalid");
            isValid = false;
          } else {
            input.classList.remove("is-invalid");
          }
        });

        if (!isValid) return;

        // Generate new ID
        const newId = "EQ" + String(tableBody.rows.length + 1).padStart(3, "0");

        // Create new row
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
      <td>${newId}</td>
      <td><img src="assets/images/no-image.png" width="50" /></td>
      <td class="hide-mobile">${inputs[0].value}</td>
      <td class="hide-mobile">${inputs[1].value}</td>
      <td class="hide-mobile">${inputs[2].value}</td>
      <td class="hide-mobile">${inputs[3].value}</td>
      <td class="hide-mobile">${inputs[4].value}</td>
      <td class="hide-mobile">${inputs[5].value}</td>
      <td>
        <button class="btn btn-primary btn-sm d-none d-md-inline show-details">Show Details</button>
      </td>
    `;
        tableBody.appendChild(newRow);

        bindShowDetails();
        form.reset();
        backToMainPage();
      });

      // Search in All tab
      document
        .getElementById("searchInput")
        .addEventListener("keyup", function () {
          let filter = this.value.toLowerCase();
          let rows = document.querySelectorAll("#all tbody tr");
          rows.forEach((row) => {
            row.style.display = row.innerText.toLowerCase().includes(filter)
              ? ""
              : "none";
          });
        });

      // Other search filters
      function tableSearch(inputId, tableSelector) {
        document.getElementById(inputId).addEventListener("keyup", function () {
          let filter = this.value.toLowerCase();
          let rows = document.querySelectorAll(tableSelector + " tbody tr");
          rows.forEach((row) => {
            row.style.display = row.innerText.toLowerCase().includes(filter)
              ? ""
              : "none";
          });
        });
      }
      tableSearch("machinerySearch", "#machinery table");
      tableSearch("maintenanceSearch", "#maintenance table");

      // Machinery tab "Show Details" → All tab
      document.querySelectorAll(".show-details-jump").forEach((btn) => {
        btn.addEventListener("click", function () {
          // Get machine/equipment name from the same row
          const row = btn.closest("tr");
          const machineName = row
            .querySelectorAll("td")[2]
            .textContent.trim()
            .toLowerCase();

          // Switch to All tab
          const tabTrigger = document.querySelector(
            'button[data-bs-target="#all"]'
          );
          if (tabTrigger) {
            new bootstrap.Tab(tabTrigger).show();
          }

          // Delay to ensure table is visible, then highlight matching row
          setTimeout(() => {
            const rows = document.querySelectorAll("#all tbody tr");
            let found = false;
            rows.forEach((tr) => {
              if (tr.innerText.toLowerCase().includes(machineName)) {
                tr.style.backgroundColor = "#ffff99";
                found = true;
                tr.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => (tr.style.backgroundColor = ""), 2000);
              }
            });
            if (!found) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }, 300);
        });
      });
