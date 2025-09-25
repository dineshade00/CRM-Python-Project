     document.getElementById("renewalForm").addEventListener("submit", function (e) {
          e.preventDefault();

          const inputs = this.querySelectorAll("input, select");
          const formData = {
            memberName: inputs[0].value,
            currentPlan: inputs[1].value,
            memberId: inputs[2].value,
            expiryDate: inputs[3].value,
            newPlan: inputs[4].value,
            amount: inputs[5].value,
            dateSubmitted: new Date().toISOString(),
          };

          let renewals = JSON.parse(localStorage.getItem("renewalsData")) || [];
          renewals.push(formData);
          localStorage.setItem("renewalsData", JSON.stringify(renewals));

          window.location.href = "renewals.html";
        });
