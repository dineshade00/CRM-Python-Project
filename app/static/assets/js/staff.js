
  function openProfileModal(img) {
    // Populate modal with data from image
    document.getElementById('modalProfileImage').src = img.dataset.img;
    document.getElementById('modalStaffId').textContent = img.dataset.id;
    document.getElementById('modalName').textContent = img.dataset.name;
    document.getElementById('modalContact').textContent = img.dataset.contact;
    document.getElementById('modalEmail').textContent = img.dataset.email;
    document.getElementById('modalAge').textContent = img.dataset.age;
    document.getElementById('modalJobPost').textContent = img.dataset.job;
    document.getElementById('modalShiftTime').textContent = img.dataset.shift;

    // Show Bootstrap modal
    var modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
  }
