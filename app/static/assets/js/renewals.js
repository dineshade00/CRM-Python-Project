            const members = [];
            const names = [
                "Rohit Sharma", "Sneha Patil", "Amit Verma", "Priya Deshmukh", "Vikram Joshi",
                "Anjali Mehra", "Rahul Kulkarni", "Neha Kaur", "Siddharth Rao", "Kavita Nair",
                "Manoj Tiwari", "Pooja Sharma", "Arjun Mehta", "Divya Iyer", "Nikhil Singh",
                "Ritika Jain", "Suresh Pawar", "Tanvi Gupta", "Ramesh Reddy", "Meena Das"
            ];

            function formatDate(date) {
                return date.toLocaleDateString("en-GB");
            }

            for (let i = 1; i <= 20; i++) {
                const joiningDate = new Date(2025, 3, i);

                // Randomized expiration logic
                const expiredDate = new Date();
                let offset;
                if (i <= 7) {
                    offset = -Math.floor(Math.random() * 15 + 1); // Expired
                } else if (i <= 14) {
                    offset = Math.floor(Math.random() * 15); // Expiring Soon
                } else {
                    offset = Math.floor(Math.random() * 30 + 16); // Active
                }
                expiredDate.setDate(expiredDate.getDate() + offset);

                members.push({
                    id: i,
                    name: names[i - 1],
                    dob: "01/01/1990",
                    email: `member${i}@example.com`,
                    joining: formatDate(joiningDate),
                    expired: formatDate(expiredDate),
                    expiredRaw: expiredDate,
                    img: i % 2 === 0 ? "https://via.placeholder.com/100" : ""  // even index: image, odd: no image
                });
            }

            let currentPage = 1;
            let entriesPerPage = 10;
            let searchTerm = "";

            function getMode(expiredDateObj) {
                const today = new Date();
                const diff = (expiredDateObj - today) / (1000 * 60 * 60 * 24);
                if (diff < 0) return '<span class="badge bg-danger">Expired</span>';
                else if (diff <= 15) return '<span class="badge bg-warning text-dark">Expiring Soon</span>';
                else return '<span class="badge bg-success">Active</span>';
            }

            function filterMembers() {
                return members.filter(m =>
                    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            function renderTable() {
                const filtered = filterMembers();
                const start = (currentPage - 1) * entriesPerPage;
                const end = start + entriesPerPage;
                const visible = filtered.slice(start, end);

                const tbody = document.getElementById("renewalBody");
                tbody.innerHTML = "";

                visible.forEach((m, i) => {
                    const mode = getMode(m.expiredRaw);
                    const imgTag = m.img
                        ? `<img src="${m.img}" class="rounded-circle" width="40" height="40" style="cursor:pointer"
                       onclick="showImagePopup('${m.img}')">`
                        : `<div class="text-muted">No Image</div>`;

                    const row = document.createElement("tr");
                    row.innerHTML = `
                <td>${m.id}</td>
                <td>${imgTag}</td>
                <td>${m.name}</td>
                <td class="d-none d-md-table-cell">${m.dob}</td>
                <td class="d-none d-md-table-cell">${m.email}</td>
                <td class="d-none d-md-table-cell">${m.joining}</td>
                <td class="d-none d-md-table-cell">${m.expired}</td>
                <td class="d-none d-md-table-cell">${mode}</td>
                <td class="d-none d-md-table-cell"><button class="btn btn-sm btn-primary" onclick="window.location.href='renew.html'">Renew</button></td>
                <td class="d-md-none text-center">
                    <button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#detail${i}">+</button>
                </td>
            `;
                    tbody.appendChild(row);

                    const detailRow = document.createElement("tr");
                    detailRow.className = "d-md-none";
                    detailRow.innerHTML = `
                <td colspan="10" class="p-0">
                    <div class="collapse" id="detail${i}">
                        <div class="p-3 bg-light">
                            <strong>DOB:</strong> ${m.dob}<br>
                            <strong>Email:</strong> ${m.email}<br>
                            <strong>Joining:</strong> ${m.joining}<br>
                            <strong>Expired:</strong> ${m.expired}<br>
                            <strong>Mode:</strong> ${mode}<br>
                            <button class="btn btn-sm btn-success mt-2" onclick="window.location.href='renew.html'">Renew</button>
                        </div>
                    </div>
                </td>
            `;
                    tbody.appendChild(detailRow);
                });

                renderPagination(filtered.length);
            }

            function renderPagination(totalItems) {
                const totalPages = Math.ceil(totalItems / entriesPerPage);
                const pag = document.getElementById("pagination");
                pag.innerHTML = "";

                const createPageItem = (page, label = page, disabled = false, active = false) => {
                    const li = document.createElement("li");
                    li.className = `page-item ${active ? "active" : ""} ${disabled ? "disabled" : ""}`;
                    li.innerHTML = `<a class="page-link" href="#" style="${active ? 'background-color: #38c66c; border-color:#38c66c; color: white;' : ''}">${label}</a>`;
                    if (!disabled) {
                        li.addEventListener("click", (e) => {
                            e.preventDefault();
                            currentPage = page;
                            renderTable();
                        });
                    }
                    return li;
                };

                pag.appendChild(createPageItem(currentPage - 1, "«", currentPage === 1));
                for (let i = 1; i <= totalPages; i++) {
                    pag.appendChild(createPageItem(i, i, false, i === currentPage));
                }
                pag.appendChild(createPageItem(currentPage + 1, "»", currentPage === totalPages));
            }

            document.getElementById("entriesSelect").addEventListener("change", function () {
                entriesPerPage = parseInt(this.value);
                currentPage = 1;
                renderTable();
            });

            document.getElementById("searchInput").addEventListener("input", function () {
                searchTerm = this.value;
                currentPage = 1;
                renderTable();
            });

            renderTable();

            // Image Popup Overlay
            const imageOverlay = document.createElement("div");
            imageOverlay.style.position = "fixed";
            imageOverlay.style.top = 0;
            imageOverlay.style.left = 0;
            imageOverlay.style.width = "100vw";
            imageOverlay.style.height = "100vh";
            imageOverlay.style.background = "rgba(0,0,0,0.6)";
            imageOverlay.style.display = "none";
            imageOverlay.style.alignItems = "center";
            imageOverlay.style.justifyContent = "center";
            imageOverlay.style.zIndex = "9999";
            imageOverlay.innerHTML = `
        <div style="position: relative; background: #fff; padding: 10px; border-radius: 8px;">
            <button onclick="hideImagePopup()" style="position:absolute; top:5px; right:8px; background: red; color: white; border: none; border-radius: 50%; width: 30px; height: 30px;">&times;</button>
            <img id="popupImage" src="" alt="Profile" style="max-width: 300px; max-height: 300px; border-radius: 10px;">
        </div>
    `;
            document.body.appendChild(imageOverlay);

            function showImagePopup(src) {
                const img = document.getElementById("popupImage");
                if (src) {
                    img.src = src;
                } else {
                    img.src = "https://via.placeholder.com/150?text=No+Image";
                }
                imageOverlay.style.display = "flex";
            }

            function hideImagePopup() {
                imageOverlay.style.display = "none";
            }


            const monthMembers = [
                { id: 1, name: "Rohit Sharma", dob: "1995-01-01", email: "rohit@gmail.com", joining: "2023-01-10", expired: "2025-08-01", location: "Nagpur", profile: "rohit.jpg" },
                { id: 2, name: "Sneha Patil", dob: "1997-03-14", email: "sneha@gmail.com", joining: "2023-02-18", expired: "2025-08-12", location: "Nagpur", profile: "sneha.jpg" },
                { id: 3, name: "Vikram Rao", dob: "1993-07-25", email: "vikram@gmail.com", joining: "2023-03-01", expired: "2025-08-05", location: "Nagpur", profile: "vikram.jpg" },
                { id: 4, name: "Pooja Kale", dob: "1999-09-30", email: "pooja@gmail.com", joining: "2023-03-20", expired: "2025-08-15", location: "Nagpur", profile: "pooja.jpg" },
                { id: 5, name: "Amit Jadhav", dob: "1991-06-11", email: "amit@gmail.com", joining: "2023-04-10", expired: "2025-08-22", location: "Nagpur", profile: "amit.jpg" },
                { id: 6, name: "Ritika Deshmukh", dob: "1996-12-02", email: "ritika@gmail.com", joining: "2023-04-25", expired: "2025-08-28", location: "Nagpur", profile: "ritika.jpg" },
                { id: 7, name: "Harshal More", dob: "1998-11-18", email: "harshal@gmail.com", joining: "2023-05-05", expired: "2025-08-30", location: "Nagpur", profile: "harshal.jpg" }
            ];

            const expiredMembers = [
                { id: 1, name: "Priya Shinde", dob: "1994-05-08", email: "priya@gmail.com", joining: "04/05/2025", expired: "04/07/2025", location: "Nagpur", profile: "priya.jpg" },
                { id: 2, name: "Karan Joshi", dob: "1990-10-19", email: "karan@gmail.com", joining: "05/05/2025", expired: "05/07/2025", location: "Nagpur", profile: "karan.jpg" },
                { id: 3, name: "Deepa Naik", dob: "1992-08-03", email: "deepa@gmail.com", joining: "06/05/2025", expired: "06/07/2025", location: "Nagpur", profile: "deepa.jpg" },
                { id: 4, name: "Sagar Kale", dob: "1995-07-22", email: "sagar@gmail.com", joining: "06/05/2025", expired: "06/07/2025", location: "Nagpur", profile: "sagar.jpg" },
                { id: 5, name: "Neha Bhosale", dob: "1999-11-09", email: "neha@gmail.com", joining: "07/05/2025", expired: "07/07/2025", location: "Nagpur", profile: "neha.jpg" },
                { id: 6, name: "Tushar Ingole", dob: "1991-04-07", email: "tushar@gmail.com", joining: "09/05/2025", expired: "07/07/2025", location: "Nagpur", profile: "tushar.jpg" }
            ];

            function renderTable(data, containerId, searchId, showCountId, paginationId) {
                const tableBody = document.getElementById(containerId);
                const searchInput = document.getElementById(searchId);
                const showCountSelect = document.getElementById(showCountId);
                const pagination = document.getElementById(paginationId);

                let currentPage = 1;
                let perPage = parseInt(showCountSelect.value);
                let filteredData = data;

                function displayTable(pageData) {
                    tableBody.innerHTML = '';
                    pageData.forEach(member => {
                        const isMonthTable = containerId === 'monthBodyCustom';
                        const btnClass = isMonthTable ? 'btn-warning text-dark' : 'btn-danger';
                        const btnLabel = isMonthTable ? 'Renew Fast' : 'Renew';

                        const row = document.createElement('tr');
                        row.innerHTML = `
                    <td>${member.id}</td>
                    <td><img src="${member.profile}" alt="Profile" width="30" height="30" class="rounded-circle"></td>
                    <td>${member.name}</td>
                    <td class="d-none d-md-table-cell">${member.dob}</td>
                    <td class="d-none d-md-table-cell">${member.email}</td>
                    <td class="d-none d-md-table-cell">${member.joining}</td>
                    <td class="d-none d-md-table-cell">${member.expired}</td>
                    <td class="d-none d-md-table-cell">
                        <button class="btn btn-sm ${btnClass}" onclick="window.location.href='renew.html'">${btnLabel}</button>
                    </td>
                    <td class="d-md-none">
                        <button class="btn btn-sm btn-outline-primary w-100" data-bs-toggle="collapse" data-bs-target="#details${member.id}">+</button>
                    </td>
                `;

                        const expandRow = document.createElement('tr');
                        expandRow.classList.add('d-md-none');
                        expandRow.innerHTML = `
                    <td colspan="9">
                        <div class="collapse" id="details${member.id}">
                            <strong>Email:</strong> ${member.email}<br>
                            <strong>Joining:</strong> ${member.joining}<br>
                            <strong>Expired:</strong> ${member.expired}<br>
                            <button class="btn btn-sm mt-2 ${btnClass}" onclick="window.location.href='renew.html'">${btnLabel}</button>
                        </div>
                    </td>
                `;

                        tableBody.appendChild(row);
                        tableBody.appendChild(expandRow);
                    });
                }

                function updatePagination(totalItems) {
                    const totalPages = Math.ceil(totalItems / perPage);
                    pagination.innerHTML = '';

                    const prevDisabled = currentPage === 1 ? 'disabled' : '';
                    const nextDisabled = currentPage === totalPages ? 'disabled' : '';

                    pagination.innerHTML += `<li class="page-item ${prevDisabled}"><a class="page-link" href="#">«</a></li>`;

                    for (let i = 1; i <= totalPages; i++) {
                        const active = i === currentPage ? 'active' : '';
                        pagination.innerHTML += `<li class="page-item ${active}"><a class="page-link" href="#">${i}</a></li>`;
                    }

                    pagination.innerHTML += `<li class="page-item ${nextDisabled}"><a class="page-link" href="#">»</a></li>`;
                }

                function paginate() {
                    const start = (currentPage - 1) * perPage;
                    const end = start + perPage;
                    displayTable(filteredData.slice(start, end));
                    updatePagination(filteredData.length);
                }

                searchInput.addEventListener('input', () => {
                    const searchTerm = searchInput.value.toLowerCase();
                    filteredData = data.filter(m => m.name.toLowerCase().includes(searchTerm) || m.email.toLowerCase().includes(searchTerm));
                    currentPage = 1;
                    paginate();
                });

                showCountSelect.addEventListener('change', () => {
                    perPage = parseInt(showCountSelect.value);
                    currentPage = 1;
                    paginate();
                });

                pagination.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('page-link')) return;
                    const text = e.target.textContent;
                    const totalPages = Math.ceil(filteredData.length / perPage);
                    if (text === '«' && currentPage > 1) currentPage--;
                    else if (text === '»' && currentPage < totalPages) currentPage++;
                    else if (!isNaN(text)) currentPage = parseInt(text);
                    paginate();
                });

                paginate();
            }

            renderTable(monthMembers, 'monthBodyCustom', 'monthSearch', 'monthShowCount', 'monthPagination');
            renderTable(expiredMembers, 'expiredBodyCustom', 'expiredSearch', 'expiredShowCount', 'expiredPagination');

window.addEventListener('DOMContentLoaded', function () {
    const data = JSON.parse(localStorage.getItem('renewalsData')) || [];

    const tbody = document.getElementById('renewalBody');
    if (!tbody) return;

    data.forEach((entry, index) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${entry.memberId}</td>
            <td><img src="assets/images/users/avatar-1.png" alt="profile" width="40" class="rounded-circle" /></td>
            <td>${entry.memberName}</td>
            <td class="d-none d-md-table-cell">01/01/1990</td>
            <td class="d-none d-md-table-cell">${entry.memberName.toLowerCase().replace(/\s+/g, '')}@example.com</td>
            <td class="d-none d-md-table-cell">${new Date(entry.dateSubmitted).toLocaleDateString()}</td>
            <td class="d-none d-md-table-cell">${new Date(entry.expiryDate).toLocaleDateString()}</td>
            <td class="d-none d-md-table-cell">
                <button class="btn btn-sm btn-primary">Active</button>
            </td>
            <td class="d-none d-md-table-cell"><span class="badge bg-success">Updated</span></td>
            <td class="d-md-none">View</td>
        `;
        tbody.appendChild(tr);
    });
});


document.getElementById("searchInput").addEventListener("keyup", function () {
    let filter = this.value.toLowerCase();
    let rows = document.querySelectorAll("#renewalTable tbody tr");

    rows.forEach(row => {
        let text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
});
