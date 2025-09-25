    
      $(document).ready(function () {
        var table = $("#datatable-col-visiblility").DataTable();

        function loadMembers() {
          let members = JSON.parse(localStorage.getItem("members")) || [];

          members = members.map((member, index) => ({
            ...member,
            id: index + 1,
          }));
          localStorage.setItem("members", JSON.stringify(members));

          table.clear();

          members.forEach((member) => {
            // Check expiry status
            const today = new Date().toISOString().split("T")[0];
            const expiry = member.expiry_date || member.expiryDate || "";

            if (expiry && expiry < today) {
              member.status = "Expired";
            } else {
              member.status = "Active";
            }

            const photoSrc =
              member.photoUrl ||
              "https://via.placeholder.com/40/CCCCCC/888888?text=No+Photo";
            const statusBadgeClass =
              member.status === "Active" ? "bg-success" : "bg-danger";

            const dueAmount = parseFloat(member.due_amount || 0);
            const actions = `
        <a class="btn btn-sm btn-info view-card-btn" data-member-id="${
          member.id
        }" title="View Profile">
          <i class="fas fa-id-card"></i>
        </a>
        <a href="edit-member.html?id=${
          member.id
        }" class="btn btn-sm btn-primary" title="Edit Member">
          <i class="fas fa-pen"></i>
        </a>
        <a class="btn btn-sm btn-danger delete-member-btn" data-member-id="${
          member.id
        }" title="Delete Member">
          <i class="fas fa-trash"></i>
        </a>
        ${
          dueAmount > 0
            ? `<button class="btn btn-sm btn-warning pay-due-btn" data-member-id="${member.id}" title="Pay Due">
                <i class="fas fa-rupee-sign"></i> Pay Due
              </button>`
            : ""
        }
      `;

            table.row.add([
              member.id,
              `<img src="${photoSrc}" alt="Photo" width="40" height="40" style="object-fit: cover; border-radius: 50%;" />`,
              member.firstName,
              member.lastName,
              member.emailAddress,
              member.membership_type,
              "₹" + (member.due_amount || 0),
              `<span class="badge ${statusBadgeClass}">${member.status}</span>`,
              actions,
            ]);
          });

          table.draw(false);
        }

        loadMembers();

        $("#datatable-col-visiblility tbody").on(
          "click",
          ".view-card-btn",
          function () {
            var id = $(this).data("member-id");
            const members = JSON.parse(localStorage.getItem("members")) || [];
            const member = members.find((m) => m.id == id);

            if (member) {
              $("#profileMemberId").text(
                "#CA-" + String(member.id).padStart(5, "0")
              );
              $("#profileFullName").text(
                member.firstName + " " + member.lastName
              );
              $("#profileDOB").text(member.dob || "N/A");
              $("#profileGender").text(member.gender || "N/A");
              $("#profileContact").text(member.contact || "N/A");
              $("#profileEmail").text(member.emailAddress || "N/A");
              $("#profileAddress").text(
                (member.address || "") + (member.city ? ", " + member.city : "")
              );
              $("#profilePincode").text(member.pincode || "N/A");
              $("#profileMembershipType").text(member.membership_type || "N/A");
              $("#profileStatus").text(member.status || "N/A");
              $("#profilePhoto").attr(
                "src",
                member.photoUrl ||
                  "https://via.placeholder.com/150/CCCCCC/888888?text=No+Photo"
              );

              $("#profileAmountPaid").text(member.amount_paid || 0);
              $("#profileDueAmount").text(member.due_amount || 0);
              $("#profileJoiningDate").text(member.joining_date || "N/A");
              $("#profileExpiryDate").text(member.expiry_date || "N/A"); // This line already exists

              $("#memberProfileSection").show();
              $(".row:has(#datatable-col-visiblility)").hide();

              $("html, body").animate(
                {
                  scrollTop: $("#memberProfileSection").offset().top,
                },
                500
              );
            }
          }
        );

        $("#profileMembershipCardBtn").on("click", function () {
          const memberIdString = $("#profileMemberId")
            .text()
            .replace("#CA-", "");
          const memberId = parseInt(memberIdString);
          const members = JSON.parse(localStorage.getItem("members")) || [];
          const member = members.find((m) => m.id === memberId);

          if (member) {
            $("#cardMemberId").text(
              "#CA-" + String(member.id).padStart(5, "0")
            );
            $("#cardName").text(member.firstName + " " + member.lastName);
            $("#cardAddress").text(
              member.address +
                ", " +
                member.city +
                (member.pincode ? ", " + member.pincode : "")
            );
            $("#cardType").text(member.membership_type);
            $("#cardPhoto").attr(
              "src",
              member.photoUrl ||
                "https://via.placeholder.com/100/CCCCCC/888888?text=No+Photo"
            );

            // --- START OF MODIFICATION ---
            let validTillDisplay = "N/A";
            if (member.expiry_date) {
              // If expiry_date exists, use it directly
              validTillDisplay = new Date(
                member.expiry_date
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            } else {
              // Fallback to existing calculation if expiry_date is not present
              let validTillDate = new Date();
              if (member.membership_start_date) {
                validTillDate = new Date(member.membership_start_date);
              } else if (member.dob) {
                validTillDate = new Date(member.dob);
              }

              if (member.membership_type?.includes("1 month")) {
                validTillDate.setMonth(validTillDate.getMonth() + 1);
              } else if (member.membership_type?.includes("3 month")) {
                validTillDate.setMonth(validTillDate.getMonth() + 3);
              } else if (member.membership_type?.includes("6 month")) {
                validTillDate.setMonth(validTillDate.getMonth() + 6);
              }
              validTillDisplay = validTillDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }
            $("#cardValidTill").text(validTillDisplay);
            // --- END OF MODIFICATION ---

            var myCardModal = new bootstrap.Modal(
              document.getElementById("membershipCardModal")
            );
            myCardModal.show();
          }
        });

        $("#datatable-col-visiblility tbody").on(
          "click",
          ".delete-member-btn",
          function () {
            var $row = $(this).closest("tr");
            if ($row.hasClass("child")) {
              $row = $row.prev();
            }

            var memberIdToDelete = $(this).data("member-id");
            var firstName = $row.find("td:eq(2)").text();
            var lastName = $row.find("td:eq(3)").text();
            var memberName = firstName + " " + lastName;

            if (
              confirm("Are you sure you want to delete " + memberName + "?")
            ) {
              let members = JSON.parse(localStorage.getItem("members")) || [];
              members = members.filter(
                (member) => member.id !== memberIdToDelete
              );

              members = members.map((member, index) => ({
                ...member,
                id: index + 1,
              }));

              localStorage.setItem("members", JSON.stringify(members));
              loadMembers();
              alert(memberName + " has been deleted successfully!");
            } else {
              alert("Deletion cancelled.");
            }
          }
        );

        // Pay Due Button Click
        $("#datatable-col-visiblility tbody").on(
          "click",
          ".pay-due-btn",
          function () {
            const memberId = $(this).data("member-id");
            const members = JSON.parse(localStorage.getItem("members")) || [];
            const member = members.find((m) => m.id == memberId);

            if (member) {
              $("#payDueMemberId").val(member.id);
              $("#payDueMembershipType").val(member.membership_type || "N/A");

              const amountPaid = parseFloat(member.amount_paid) || 0;
              const dueAmount = parseFloat(member.due_amount) || 0;

              $("#payDueTotalAmount").val("₹" + (amountPaid + dueAmount));
              $("#payDueAmountPaid").val("₹" + amountPaid);
              $("#payDueAmount").val("₹" + dueAmount);

              new bootstrap.Modal(
                document.getElementById("payDueModal")
              ).show();
            }
          }
        );

        // Pay Due Submit
        $("#payDueForm").on("submit", function (e) {
          e.preventDefault();
          const memberId = parseInt($("#payDueMemberId").val());
          let members = JSON.parse(localStorage.getItem("members")) || [];

          const memberIndex = members.findIndex((m) => m.id === memberId);
          if (memberIndex !== -1) {
            members[memberIndex].amount_paid =
              parseFloat(members[memberIndex].amount_paid) +
              parseFloat(members[memberIndex].due_amount);
            members[memberIndex].due_amount = 0;
            localStorage.setItem("members", JSON.stringify(members));
            loadMembers();

            bootstrap.Modal.getInstance(
              document.getElementById("payDueModal")
            ).hide();
            alert("Due Amount Paid Successfully!!!");
          }
        });
      });

      function calculateExpiringDate(joiningDateStr, membershipType) {
        if (!joiningDateStr || !membershipType) return "N/A";

        const joiningDate = new Date(joiningDateStr);
        let monthsToAdd = 0;

        if (membershipType.includes("1 month")) monthsToAdd = 1;
        else if (membershipType.includes("3 month")) monthsToAdd = 3;
        else if (membershipType.includes("6 month")) monthsToAdd = 6;

        const expiringDate = new Date(joiningDate);
        expiringDate.setMonth(expiringDate.getMonth() + monthsToAdd);

        return expiringDate.toISOString().split("T")[0];
      }

      function populateMemberProfile(member) {
        document.getElementById("profileMemberId").innerText = member.id || "";
        document.getElementById("profileFullName").innerText = `${
          member.first_name || ""
        } ${member.last_name || ""}`;
        document.getElementById("profileDOB").innerText = member.dob || "";
        document.getElementById("profileGender").innerText =
          member.gender || "";
        document.getElementById("profileContact").innerText =
          member.contact || "";
        document.getElementById("profileEmail").innerText = member.email || "";
        document.getElementById("profileAddress").innerText =
          member.address || "";

        // Right column details
        document.getElementById("profilePincode").innerText =
          member.pincode || "";
        document.getElementById("profileMembershipType").innerText =
          member.membership_type || "";
        document.getElementById("profileStatus").innerText =
          member.status || "";
        document.getElementById("profileAmountPaid").innerText =
          member.amount_paid || "0";
        document.getElementById("profileDueAmount").innerText =
          member.due_amount || "0";

        // Joining and Expiry Date
        document.getElementById("profileJoiningDate").innerText =
          member.joining_date || "";
        document.getElementById("profileExpiryDate").innerText =
          member.expiry_date || ""; // This is for the profile section
      }

      // Back to Members button
      $("#backToMembersBtn").on("click", function () {
        $("#memberProfileSection").hide();
        $(".row:has(#datatable-col-visiblility)").show();
        $("html, body").animate({ scrollTop: 0 }, 300);
      });
    
