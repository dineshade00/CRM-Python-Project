const typeSelect = document.getElementById("membershipType");
const popup = document.getElementById("addTypePopup");
let plans = {
  // basic: { amount: "999", offer: "Free diet plan", duration: "1 Month" },
  // standard: {
  //   amount: "2499",
  //   offer: "1 week free training",
  //   duration: "3 Months",
  // },
  // premium: { amount: "4499", offer: "Free gym kit", duration: "6 Months" },
  // personal: {
  //   amount: "2499",
  //   offer: "Dedicated trainer & diet plan",
  //   duration: "1 Month",
  // },
};

// Load from localStorage
const storedPlans = JSON.parse(localStorage.getItem("customPlans") || "{}");
plans = { ...plans, ...storedPlans };

function populateDropdown() {
  typeSelect.innerHTML = `<option value="" selected disabled>Select Type</option>`;
  Object.keys(plans).forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = capitalize(key);
    typeSelect.appendChild(opt);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateDetails() {
  const type = typeSelect.value;
  document.getElementById("membershipAmount").value = plans[type]?.amount || "";
  document.getElementById("membershipOffer").value = plans[type]?.offer || "";
  document.getElementById("membershipDuration").value =
    plans[type]?.duration || "";
}

function showAddForm() {
  popup.classList.add("show");
}

function hideAddForm() {
  popup.classList.remove("show");
  document.getElementById("newTypeForm").reset();
}

document
  .getElementById("membershipForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const type = typeSelect.value;
    const amount = document.getElementById("membershipAmount").value;
    const offer = document.getElementById("membershipOffer").value;
    const duration = document.getElementById("membershipDuration").value;

    const data = JSON.parse(localStorage.getItem("memberships") || "[]");
    data.push({ type, amount, offer, duration });
    localStorage.setItem("memberships", JSON.stringify(data));

    alert("Membership added!");
    this.reset();
  });

document.getElementById("newTypeForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const newType = document.getElementById("newType").value.trim().toLowerCase();
  const newAmount = document.getElementById("newAmount").value.trim();
  let newOffer = document.getElementById("newOffer").value.trim();
  if (!newOffer) {
    newOffer = "No Offers";
  }

  const newDuration = document.getElementById("newDuration").value.trim();

  if (!newType || !newAmount || !newDuration) {
    alert("Please fill all required fields.");
    return;
  }

  // Save new plan
  plans[newType] = {
    amount: newAmount,
    offer: newOffer,
    duration: newDuration,
  };
  const stored = JSON.parse(localStorage.getItem("customPlans") || "{}");
  stored[newType] = {
    amount: newAmount,
    offer: newOffer,
    duration: newDuration,
  };
  localStorage.setItem("customPlans", JSON.stringify(stored));

  populateDropdown();

  // Auto select and show details
  typeSelect.value = newType;
  updateDetails();

  hideAddForm(); // Close popup
});

// Initial setup
populateDropdown();
