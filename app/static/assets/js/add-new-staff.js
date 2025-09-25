  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;
    const firstName = form.querySelector('input[placeholder="Enter First Name"]').value;
    const lastName = form.querySelector('input[placeholder="Enter Last Name"]').value;
    const email = form.querySelector('input[placeholder="Enter Email Address"]').value;
    const contact = form.querySelector('input[placeholder="Enter Contact No."]').value;
    const jobPost = form.querySelector('select[name="jobPost"]').value;
    const photoFile = form.querySelector('input[type="file"]').files[0];

    let photoURL = "";
    if (photoFile) {
      photoURL = URL.createObjectURL(photoFile);
    }

    // Generate a unique staff ID (e.g. GYM + random number)
    const staffId = "GYM" + Math.floor(Math.random() * 1000 + 11);

    const newStaff = {
      staffId,
      firstName,
      lastName,
      email,
      contact,
      jobPost,
      photo: photoURL,
    };

    // Get existing or initialize array
    const staffList = JSON.parse(localStorage.getItem("staffList") || "[]");
    staffList.push(newStaff);
    localStorage.setItem("staffList", JSON.stringify(staffList));

    alert("Staff added successfully!");
    window.location.href = "show-all-staff.html";
  });

