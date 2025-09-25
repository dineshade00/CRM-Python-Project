const params = new URLSearchParams(window.location.search);
let index = params.get("index");
let data = JSON.parse(localStorage.getItem("memberships") || "[]");
let plans = {
  //   basic: { amount: "999", offer: "Free diet plan" },
  //   standard: { amount: "2499", offer: "1 week free training" },
  //   premium: { amount: "4499", offer: "Free gym kit" },
  //   personal: { amount: "2499", offer: "Dedicated trainer & diet plan" },
};

// Merge custom plans from localStorage
const storedPlans = JSON.parse(localStorage.getItem("customPlans") || "{}");
plans = { ...plans, ...storedPlans };

// Populate dropdown with all plans
const typeSelect = document.getElementById("membershipType");
typeSelect.innerHTML = `<option value="" disabled>Select Type</option>`;
Object.keys(plans).forEach((key) => {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = capitalize(key);
  typeSelect.appendChild(opt);
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fallback index if invalid
if (index === null || !data[index]) {
  if (data.length === 0) {
    alert("No membership data found.");
    window.location.href = "view-plan.html";
  } else {
    index = 0;
  }
}

// Pre-fill form
const entry = data[index];
document.getElementById("membershipType").value = entry.type;
document.getElementById("membershipAmount").value = entry.amount;
document.getElementById("membershipDuration").value = entry.duration;
document.getElementById("membershipOffer").value = entry.offer;

// Update on change (optional)
document
  .getElementById("membershipType")
  .addEventListener("change", function () {
    const selected = this.value;
    if (plans[selected]) {
      document.getElementById("membershipAmount").value =
        plans[selected].amount;
      document.getElementById("newDuration").value = plans[selected].duration;
      document.getElementById("membershipOffer").value = plans[selected].offer;
    }
  });

// Save edits

document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const offerInput = document.getElementById("membershipOffer").value.trim();
  const updated = {
    type: document.getElementById("membershipType").value,
    amount: document.getElementById("membershipAmount").value,
    duration: document.getElementById("membershipDuration").value,
    offer: offerInput !== "" ? offerInput : "No Offers", //  fallback
  };

  data[index] = updated;
  localStorage.setItem("memberships", JSON.stringify(data));
  alert("Updated successfully.");
  window.location.href = "view-plan.html";
});
