      document.addEventListener("DOMContentLoaded", () => {
        const data = JSON.parse(localStorage.getItem("editStaffData"));
        if (!data) return;

        const form = document.querySelector("form");
        const inputs = form.querySelectorAll("input, select");

        inputs.forEach((input) => {
          if (input.placeholder === "Enter First Name") {
            input.value = data.firstName;
          } else if (input.placeholder === "Enter Last Name") {
            input.value = data.lastName;
          } else if (input.placeholder === "Enter Email Address") {
            input.value = data.email;
          } else if (input.placeholder === "Enter Contact No.") {
            input.value = data.contact;
          } else if (input.type === "date") {
            input.value = data.joiningDate;
          } else if (input.type === "file") {
            // Skip file input
          }
        });

        const select = form.querySelector("select.form-select");
        if (select && data.jobPost) {
          select.value = data.jobPost;
        }

        // Optional: clear after use
        localStorage.removeItem("editStaffData");
      });
  
