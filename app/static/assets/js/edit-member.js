
      document.addEventListener("DOMContentLoaded", function () {
        const editMemberForm = document.getElementById("editMemberForm");
        const memberIdToEditInput = document.getElementById("memberIdToEdit");
        const photoInput = document.getElementById("photo");
        const successModal = new bootstrap.Modal(
          document.getElementById("successModal")
        );
        const errorModal = new bootstrap.Modal(
          document.getElementById("errorModal")
        );
        const errorMessageText = document.getElementById("errorMessageText");
        const membershipTypeDropdown =
          document.getElementById("membership_type");
        const paidAmountInput = document.getElementById("paidAmount");
        const dueAmountInput = document.getElementById("dueAmount");
        const joiningDateInput = document.getElementById("joiningDate");
        const expiryDateInput = document.getElementById("expiryDate");
        const memberships = JSON.parse(
          localStorage.getItem("memberships") || "[]"
        );

        // --- Helper Functions ---
        function getQueryParam(param) {
          const urlParams = new URLSearchParams(window.location.search);
          return urlParams.get(param);
        }

        function calculateExpiryDate() {
          const selectedPlan = memberships.find(
            (plan) => plan.type === membershipTypeDropdown.value
          );
          const joiningDate = joiningDateInput.value;

          if (selectedPlan && joiningDate) {
            const duration = selectedPlan.duration;
            const [value, unit] = duration.split(" ");
            const startDate = new Date(joiningDate);
            let endDate = new Date(startDate);

            if (
              unit.toLowerCase() === "month" ||
              unit.toLowerCase() === "months"
            ) {
              endDate.setMonth(endDate.getMonth() + parseInt(value, 10));
            } else if (
              unit.toLowerCase() === "year" ||
              unit.toLowerCase() === "years"
            ) {
              endDate.setFullYear(endDate.getFullYear() + parseInt(value, 10));
            }

            const formattedExpiryDate = endDate.toISOString().slice(0, 10);
            expiryDateInput.value = formattedExpiryDate;
          } else {
            expiryDateInput.value = "";
          }
        }

        function calculateDueAmount() {
          const selectedPlan = memberships.find(
            (plan) => plan.type === membershipTypeDropdown.value
          );
          const planAmount = selectedPlan ? parseFloat(selectedPlan.amount) : 0;
          const paidAmount = parseFloat(paidAmountInput.value) || 0;
          const dueAmount = planAmount - paidAmount;
          dueAmountInput.value = dueAmount.toFixed(2);
        }

        function populateMembershipPlans() {
          membershipTypeDropdown.innerHTML =
            '<option value="">Select Membership Type</option>';
          memberships.forEach((plan) => {
            const option = document.createElement("option");
            option.value = plan.type;
            option.textContent = capitalize(plan.type);
            membershipTypeDropdown.appendChild(option);
          });
        }

        function handlePlanSelection() {
          const selectedPlan = memberships.find(
            (plan) => plan.type === membershipTypeDropdown.value
          );
          if (selectedPlan) {
            paidAmountInput.value = selectedPlan.amount;
          } else {
            paidAmountInput.value = "";
          }
          calculateDueAmount();
          calculateExpiryDate();
        }

        // --- Event Listeners ---
        membershipTypeDropdown.addEventListener("change", handlePlanSelection);
        paidAmountInput.addEventListener("input", calculateDueAmount);
        joiningDateInput.addEventListener("change", calculateExpiryDate);

        // --- Load Member Data on Page Load ---
        const memberId = getQueryParam("id");
        populateMembershipPlans(); // Populate dropdown first

        if (memberId) {
          const members = JSON.parse(localStorage.getItem("members")) || [];
          const member = members.find((m) => m.id === parseInt(memberId));

          if (member) {
            memberIdToEditInput.value = member.id;
            document.getElementById("firstName").value = member.firstName || "";
            document.getElementById("lastName").value = member.lastName || "";
            document.getElementById("emailAddress").value =
              member.emailAddress || "";
            document.getElementById("contact").value = member.contact || "";
            document.getElementById("gender").value = member.gender || "";
            document.getElementById("dob").value = member.dob || "";
            document.getElementById("address").value = member.address || "";
            document.getElementById("city").value = member.city || "";
            document.getElementById("pincode").value = member.pincode || "";

            // Fill new fields and calculate amounts
            membershipTypeDropdown.value = member.membership_type || "";
            joiningDateInput.value = member.joiningDate || "";

            // Call handlePlanSelection to set paid and due amounts based on the selected plan
            handlePlanSelection();

            // Then, set the paid amount back to the member's previously paid amount and recalculate due amount
            paidAmountInput.value = member.paidAmount || "";
            calculateDueAmount();
          } else {
            errorMessageText.textContent = "Member not found!";
            errorModal.show();
            errorModal._element.addEventListener(
              "hidden.bs.modal",
              function () {
                window.location.href = "show-all-member.html";
              },
              { once: true }
            );
          }
        } else {
          errorMessageText.textContent =
            "No member ID provided for editing. Redirecting...";
          errorModal.show();
          errorModal._element.addEventListener(
            "hidden.bs.modal",
            function () {
              window.location.href = "show-all-member.html";
            },
            { once: true }
          );
        }

        // --- Form Submission Handling ---
        editMemberForm.addEventListener("submit", function (event) {
          event.preventDefault();
          event.stopPropagation();

          let formIsValid = true;
          const updatedMemberData = {};

          editMemberForm.querySelectorAll("[required]").forEach((field) => {
            if (
              field.value.trim() === "" ||
              (field.tagName === "SELECT" && field.value === "")
            ) {
              field.classList.add("is-invalid");
              formIsValid = false;
            } else {
              field.classList.remove("is-invalid");
              updatedMemberData[field.id] = field.value.trim();
            }
          });

          // Also handle non-required but existing fields
          const nonRequiredFields = [
            "paidAmount",
            "dueAmount",
            "joiningDate",
            "expiryDate",
          ];
          nonRequiredFields.forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) {
              updatedMemberData[fieldId] = field.value.trim();
            }
          });

          const contactField = document.getElementById("contact");
          if (
            !contactField.checkValidity() ||
            contactField.value.length !== 10
          ) {
            contactField.classList.add("is-invalid");
            formIsValid = false;
          } else {
            contactField.classList.remove("is-invalid");
          }

          const pincodeField = document.getElementById("pincode");
          if (!pincodeField.checkValidity()) {
            pincodeField.classList.add("is-invalid");
            formIsValid = false;
          } else {
            pincodeField.classList.remove("is-invalid");
          }

          if (photoInput.files.length > 0) {
            const file = photoInput.files[0];
            const fileType = file.type;
            const validImageTypes = ["image/jpeg", "image/png"];

            if (validImageTypes.includes(fileType)) {
              const reader = new FileReader();
              reader.onload = function (e) {
                updatedMemberData.photoUrl = e.target.result;
                saveMemberData(updatedMemberData, formIsValid);
              };
              reader.readAsDataURL(file);
              photoInput.classList.remove("is-invalid");
            } else {
              photoInput.classList.add("is-invalid");
              photoInput.nextElementSibling.textContent =
                "Please upload a photo (only .jpg, .jpeg, .png formats allowed).";
              formIsValid = false;
              saveMemberData(updatedMemberData, formIsValid);
            }
          } else {
            const members = JSON.parse(localStorage.getItem("members")) || [];
            const memberIdToUpdate = parseInt(memberIdToEditInput.value);
            const member = members.find((m) => m.id === memberIdToUpdate);

            updatedMemberData.photoUrl =
              member && member.photoUrl
                ? member.photoUrl
                : "https://via.placeholder.com/150/CCCCCC/888888?text=No+Photo";
            saveMemberData(updatedMemberData, formIsValid);
          }
        });

        function saveMemberData(updatedMemberData, formIsValid) {
          if (formIsValid) {
            let members = JSON.parse(localStorage.getItem("members")) || [];
            const memberIdToUpdate = parseInt(memberIdToEditInput.value);

            const memberIndex = members.findIndex(
              (m) => m.id === memberIdToUpdate
            );

            if (memberIndex !== -1) {
              members[memberIndex] = {
                ...members[memberIndex],
                firstName: updatedMemberData.firstName,
                lastName: updatedMemberData.lastName,
                contact: updatedMemberData.contact,
                emailAddress: updatedMemberData.emailAddress,
                gender: updatedMemberData.gender,
                dob: updatedMemberData.dob,
                address: updatedMemberData.address,
                city: updatedMemberData.city,
                pincode: updatedMemberData.pincode,
                photoUrl: updatedMemberData.photoUrl,
                membership_type: updatedMemberData.membership_type,
                amount_paid: updatedMemberData.paidAmount,
                due_amount: updatedMemberData.dueAmount,
                joining_date: updatedMemberData.joiningDate,
                expiry_date: updatedMemberData.expiryDate,
                status: "Active",
              };

              localStorage.setItem("members", JSON.stringify(members));
              successModal.show();
            } else {
              errorMessageText.textContent =
                "Error: Member not found for update.";
              errorModal.show();
            }
          } else {
            errorMessageText.textContent =
              errorMessageText.textContent === ""
                ? "Please fill in all required fields correctly."
                : errorMessageText.textContent;
            errorModal.show();
          }
        }

        function capitalize(text) {
          return text.charAt(0).toUpperCase() + text.slice(1);
        }
      });
