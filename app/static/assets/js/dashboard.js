        document.addEventListener("DOMContentLoaded", () => {
            const allDetails = document.querySelectorAll("table details");

            allDetails.forEach((detail) => {
                const summary = detail.querySelector("summary");

                summary.addEventListener("click", (e) => {
                    e.preventDefault();

                    const isOpen = detail.hasAttribute("open");

                    // Close all other details
                    allDetails.forEach((otherDetail) => {
                        if (otherDetail !== detail) {
                            otherDetail.removeAttribute("open");
                            otherDetail.querySelector("summary").textContent = "Show";
                        }
                    });

                    // Toggle current detail
                    if (isOpen) {
                        detail.removeAttribute("open");
                        summary.textContent = "Show";
                    } else {
                        detail.setAttribute("open", "");
                        summary.textContent = "Hide";
                    }
                });
            });
        });

    <!-- Chart Script -->
        const ctx = document.getElementById("revenueBarChart").getContext("2d");

        let revenueChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Revenue (₹)",
                        data: [],
                        backgroundColor: "#38c66c",
                        borderRadius: 5,
                        barPercentage: 0.4,
                        categoryPercentage: 0.5,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => "₹" + value,
                        },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => "₹" + context.parsed.y,
                        },
                    },
                },
            },
        });

        const monthlyRevenue = {
            Jan: 105000,
            Feb: 97000,
            Mar: 112000,
            Apr: 128000,
            May: 122000,
            Jun: 119000,
            Jul: 134000,
            Aug: 110000,
            Sep: 98000,
            Oct: 126000,
            Nov: 124000,
            Dec: 143000,
        };

        function updateChart(labels, data) {
            // Adjust bar width dynamically
            let count = labels.length;
            let barP = 0.4,
                catP = 0.5;
            if (count >= 10) {
                barP = 0.25;
                catP = 0.4;
            } else if (count >= 6) {
                barP = 0.3;
                catP = 0.45;
            }

            revenueChart.data.labels = labels;
            revenueChart.data.datasets[0].data = data;
            revenueChart.data.datasets[0].barPercentage = barP;
            revenueChart.data.datasets[0].categoryPercentage = catP;
            revenueChart.update();

            const total = data.reduce((a, b) => a + b, 0);
            const avg = Math.round(total / data.length);
            const max = Math.max(...data);

            document.getElementById("totalRevenue").innerText =
                "₹" + total.toLocaleString();
            document.getElementById("avgRevenue").innerText =
                "₹" + avg.toLocaleString();
            document.getElementById("maxRevenue").innerText =
                "₹" + max.toLocaleString();
        }

        function generateWeeklyRevenue(fromDate, toDate) {
            const weeks = [];
            const labels = [];
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            let current = new Date(fromDate);
            let weekCount = 1;

            while (current < toDate) {
                const next = new Date(current.getTime() + oneWeek);
                labels.push(`Week ${weekCount++}`);
                weeks.push(Math.floor(25000 + Math.random() * 20000)); // Dummy data
                current = next;
            }

            return { labels, data: weeks };
        }

        // Range Buttons
        document.querySelectorAll(".range-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const range = btn.dataset.range;
                let selectedMonths = [];

                switch (range) {
                    case "2M":
                        selectedMonths = ["Jun", "Jul"];
                        break;
                    case "3M":
                        selectedMonths = ["May", "Jun", "Jul"];
                        break;
                    case "4M":
                        selectedMonths = ["Apr", "May", "Jun", "Jul"];
                        break;
                    case "6M":
                        selectedMonths = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
                        break;
                    case "1Y":
                        selectedMonths = Object.keys(monthlyRevenue);
                        break;
                }

                const revenueValues = selectedMonths.map(
                    (month) => monthlyRevenue[month]
                );
                updateChart(selectedMonths, revenueValues);
            });
        });

        // Weekly Filter
        document.getElementById("filterBtn").addEventListener("click", () => {
            const fromVal = document.getElementById("revenueFromDate").value;
            const toVal = document.getElementById("revenueToDate").value;

            if (!fromVal || !toVal) {
                alert("Please select both From and To dates.");
                return;
            }

            const fromDate = new Date(fromVal);
            const toDate = new Date(toVal);

            if (fromDate >= toDate) {
                alert("Please select a valid date range.");
                return;
            }

            const { labels, data } = generateWeeklyRevenue(fromDate, toDate);
            updateChart(labels, data);
        });

        // Load Default Chart
        document.querySelector('[data-range="3M"]').click();

const birthdayData = [
    { name: "Rohan Mehra", type: "Staff", date: "2025-08-06", img: "https://tse1.mm.bing.net/th/id/OIP.cTJl-ErCmYonrsJstXfQEwHaJi?pid=Api&P=0&h=180" },
    { name: "Sneha Joshi", type: "Member", date: "2025-08-07", img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Arjun Yadav", type: "Staff", date: "2025-08-12", img: "" },
    { name: "Simran Kaur", type: "Member", date: "2025-08-25", img: "" },
    { name: "Vikas Jain", type: "Staff", date: "2025-08-10", img: "https://randomuser.me/api/portraits/men/15.jpg" },
    { name: "Riya Kapoor", type: "Member", date: "2025-08-18", img: "" },
    { name: "Tushar Roy", type: "Staff", date: "2025-08-28", img: "https://randomuser.me/api/portraits/men/22.jpg" },
    { name: "Kunal Singh", type: "Member", date: "2025-08-09", img: "" },
    { name: "Preeti Sharma", type: "Staff", date: "2025-08-03", img: "https://randomuser.me/api/portraits/women/21.jpg" },
    { name: "Ankit Verma", type: "Member", date: "2025-08-14", img: "" },
    { name: "Meena Kumari", type: "Staff", date: "2025-08-19", img: "https://randomuser.me/api/portraits/women/45.jpg" },
    { name: "Sunil Dutt", type: "Member", date: "2025-08-27", img: "" },
    { name: "Payal Rathore", type: "Staff", date: "2025-08-16", img: "https://randomuser.me/api/portraits/women/25.jpg" },
    { name: "Tarun Goel", type: "Member", date: "2025-08-13", img: "" },
    { name: "Diksha Rana", type: "Staff", date: "2025-08-23", img: "https://randomuser.me/api/portraits/women/55.jpg" },
    { name: "Mohan Das", type: "Member", date: "2025-08-21", img: "" },
    { name: "Alka Jain", type: "Staff", date: "2025-08-30", img: "https://randomuser.me/api/portraits/women/32.jpg" },
    { name: "Rahul More", type: "Member", date: "2025-08-06", img: "" },
    { name: "Neha Kulkarni", type: "Staff", date: "2025-08-11", img: "https://randomuser.me/api/portraits/women/38.jpg" },
    { name: "Amit Thorat", type: "Member", date: "2025-08-20", img: "" }
];

        const todaySlider = document.getElementById("todaySlider");
        const upcomingSlider = document.getElementById("upcomingSlider");
        const searchedSlider = document.getElementById("searchedSlider");

        const today = new Date().toISOString().slice(0, 10);
        const thisMonth = new Date().getMonth();
        let currentBirthdayList = [];

        // Utility - Create Card
        function createCard(person) {
            const imgSrc = person.img && person.img.trim() !== ""
                ? person.img
                : "https://via.placeholder.com/100?text=No+Image";
            return `
        <div class="card p-2 text-center" style="min-width: 180px;">
            <img src="${imgSrc}" class="rounded-circle mx-auto" width="80" height="80" style="object-fit:cover;" alt="">
            <h6 class="mt-2 mb-0">${person.name}</h6>
            <small class="text-muted">${person.type}</small>
            <div class="text-danger">🎂 ${new Date(person.date).toDateString()}</div>
        </div>
    `;
        }

        // Render Slider
        function renderSlider(data, container) {
            container.innerHTML = "";
            if (data.length === 0) {
                container.innerHTML = `<div class="text-center text-muted w-100 py-4">No Birthdays 🎂</div>`;
                return;
            }
            data.forEach(person => container.innerHTML += createCard(person));
            startAutoScroll(container);
        }

        // Auto Scroll
        function startAutoScroll(slider) {
            let scrollAmount = 0;
            setInterval(() => {
                if (slider.scrollWidth > slider.clientWidth) {
                    scrollAmount += 1;
                    if (scrollAmount >= slider.scrollWidth - slider.clientWidth) scrollAmount = 0;
                    slider.scrollTo({ left: scrollAmount, behavior: "smooth" });
                }
            }, 40);
        }

        // Show Only One Slider
        function showOnlySlider(target) {
            [todaySlider, upcomingSlider, searchedSlider].forEach(s => s.style.display = "none");
            target.style.display = "flex";
        }

        // Show Popup
        function showPopup(birthdays) {
            const popup = new bootstrap.Modal(document.getElementById("birthdayPopup"));
            const container = document.getElementById("popupBirthdayContainer");
            container.innerHTML = "";
            currentBirthdayList = birthdays;

            if (birthdays.length === 0) {
                container.innerHTML = `<div class="text-center text-muted w-100 py-4"><h6>There is No birthday today 🎂</h6></div>`;
            } else {
                birthdays.forEach(person => {
                    const imgSrc = person.img && person.img.trim() !== ""
                        ? person.img
                        : "https://via.placeholder.com/100?text=No+Image";
                    container.innerHTML += `
                <div class="card p-3 text-center shadow-sm" style="width: 200px;">
                    <img src="${imgSrc}" class="rounded-circle mx-auto" width="80" height="80" style="object-fit:cover;" alt="">
                    <h6 class="mt-2 mb-0">${person.name}</h6>
                    <small class="text-muted">${person.type}</small>
                    <p class="text-success">🎂 Happy Birthday!</p>
                </div>
            `;
                });
            }
            popup.show();
        }

        // WhatsApp Wishes
        function sendCombinedWhatsAppWishes() {
            if (currentBirthdayList.length === 0) return;
            const names = currentBirthdayList.map(p => p.name).join(", ");
            const msg = `🎉 Clivax Gym wishes a very Happy Birthday to ${names}! 🎂🥳 Stay strong and fabulous! 💪`;
            window.open(`https://wa.me/919999999999?text=${encodeURIComponent(msg)}`, "_blank");
            bootstrap.Modal.getInstance(document.getElementById("birthdayPopup")).hide();
        }

        // Event Listeners
        document.getElementById("toggleTodayBtn").addEventListener("click", () => {
            const todays = birthdayData.filter(b => b.date === today);
            showOnlySlider(todaySlider);
            renderSlider(todays, todaySlider);
            showPopup(todays);
        });

        document.getElementById("toggleUpcomingBtn").addEventListener("click", () => {
            const upcoming = birthdayData.filter(b => {
                const bday = new Date(b.date);
                return bday > new Date(today) && bday.getMonth() === thisMonth;
            });
            showOnlySlider(upcomingSlider);
            renderSlider(upcoming, upcomingSlider);
            showPopup(upcoming);
        });

        document.getElementById("searchDateBtn").addEventListener("click", () => {
            const selected = document.getElementById("birthdayDate").value;
            const matches = birthdayData.filter(b => b.date === selected);
            showOnlySlider(searchedSlider);
            renderSlider(matches, searchedSlider);
            showPopup(matches);
        });

        // On Page Load - Show Today's Birthdays
        window.addEventListener("DOMContentLoaded", () => {
            const todays = birthdayData.filter(b => b.date === today);
            showOnlySlider(todaySlider);
            renderSlider(todays, todaySlider);
            showPopup(todays);
        });

        const saleForm = document.getElementById("saleForm");
        const transactionBody = document.getElementById("transactionBody");
        const supplementTotal = document.getElementById("supplementTotal");

        function toggleSaleForm() {
            const form = document.getElementById("saleFormContainer");
            const transaction = document.getElementById("transactionModal");
            form.style.display = form.style.display === "none" ? "block" : "none";
            transaction.style.display = "none";
        }

        function toggleTransactionModal() {
            const transaction = document.getElementById("transactionModal");
            const form = document.getElementById("saleFormContainer");
            transaction.style.display =
                transaction.style.display === "none" ? "block" : "none";
            form.style.display = "none";
        }

        function saveTransactions(transactions) {
            localStorage.setItem("transactions", JSON.stringify(transactions));
        }

        function getTransactions() {
            return JSON.parse(localStorage.getItem("transactions")) || [];
        }

        function updateTable() {
            const transactions = getTransactions();
            transactionBody.innerHTML = "";
            let totalSum = 0;

            transactions.forEach((tx, index) => {
                const total = tx.quantity * tx.price;
                totalSum += total;

                const row = `
          <tr>
            <td>${tx.product}</td>
            <td>${tx.quantity}</td>
            <td>₹${tx.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                })}</td>
            <td class="fw-bold">₹${total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                })}</td>
            <td>${tx.saleDate || "-"}</td>
            <td class="d-print-none"><span class="text-danger" style="cursor:pointer" onclick="deleteRow(${index})">Delete</span></td>
          </tr>
        `;
                transactionBody.insertAdjacentHTML("beforeend", row);
            });

            supplementTotal.textContent = `₹${totalSum.toLocaleString(undefined, {
                minimumFractionDigits: 0,
            })}`;
        }

        function deleteRow(index) {
            const transactions = getTransactions();
            transactions.splice(index, 1);
            saveTransactions(transactions);
            updateTable();
        }

        saleForm?.addEventListener("submit", function (e) {
            e.preventDefault();

            const product = document.getElementById("productName").value.trim();
            const quantity = parseInt(document.getElementById("quantity").value);
            const price = parseFloat(document.getElementById("price").value);
            const saleDate = document.getElementById("saleDate").value;

            const transactions = getTransactions();
            transactions.push({ product, quantity, price, saleDate });
            saveTransactions(transactions);
            updateTable();

            saleForm.reset();
            toggleSaleForm();
        });

        document.addEventListener("DOMContentLoaded", updateTable);

        document.addEventListener("click", function (e) {
            const saleFormEl = document.getElementById("saleFormContainer");
            const transactionEl = document.getElementById("transactionModal");
            const saleBtn = document.getElementById("toggleFormBtn");
            const transactionBtn = document.getElementById("transactionToggleBtn");

            if (
                saleFormEl &&
                !saleFormEl.contains(e.target) &&
                !saleBtn.contains(e.target) &&
                saleFormEl.style.display === "block"
            ) {
                saleFormEl.style.display = "none";
            }

            if (
                transactionEl &&
                !transactionEl.contains(e.target) &&
                !transactionBtn.contains(e.target) &&
                transactionEl.style.display === "block"
            ) {
                transactionEl.style.display = "none";
            }
        });

        function printSpecificContent(elementId) {
            window.print();
        }

        document.querySelectorAll('.toggle-row').forEach(function (btn) {
            btn.addEventListener('click', function () {
                let extraRow = this.closest('tr').nextElementSibling;
                extraRow.classList.toggle('d-none');
                this.textContent = extraRow.classList.contains('d-none') ? '+' : '-';
            });
        });
