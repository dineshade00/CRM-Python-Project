 const saveDietPlan = () => {
                const goalType = document.getElementById('goalType').value;
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                const breakfast = document.getElementById('breakfast').value;
                const lunch = document.getElementById('lunch').value;
                const dinner = document.getElementById('dinner').value;
                const snacks = document.getElementById('snacks').value;
                const water = document.getElementById('water').value;
                const editingIndex = document.getElementById('editingIndex').value;

                if (!goalType || !startDate || !endDate) {
                    alert('Please fill all required fields.');
                    return;
                }

                const dietPlans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
                const plan = {
                    goalType, breakfast, lunch, dinner, snacks, water,
                    duration: formatDate(startDate) + ' - ' + formatDate(endDate)
                };

                if (editingIndex === "") {
                    dietPlans.push(plan);
                } else {
                    dietPlans[editingIndex] = plan;
                    document.getElementById('editingIndex').value = "";
                }

                localStorage.setItem('dietPlans', JSON.stringify(dietPlans));
                resetForm();
                renderTable();
                bootstrap.Tab.getOrCreateInstance(document.querySelector('[data-bs-target="#dietTableTab"]')).show();
            };

            const renderTable = () => {
                const dietPlans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
                const tbody = document.getElementById('dietTableBody');
                tbody.innerHTML = "";

                dietPlans.forEach((plan, index) => {
                    const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${plan.goalType}</td>
          <td>${plan.breakfast}</td>
          <td>${plan.lunch}</td>
          <td>${plan.dinner}</td>
          <td>${plan.snacks}</td>
          <td>${plan.water}</td>
          <td>${plan.duration}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="editPlan(${index})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deletePlan(${index})">Delete</button>
          </td>
        </tr>
      `;
                    tbody.innerHTML += row;
                });
            };

            const editPlan = (index) => {
                const dietPlans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
                const plan = dietPlans[index];
                document.getElementById('goalType').value = plan.goalType;
                document.getElementById('breakfast').value = plan.breakfast;
                document.getElementById('lunch').value = plan.lunch;
                document.getElementById('dinner').value = plan.dinner;
                document.getElementById('snacks').value = plan.snacks;
                document.getElementById('water').value = plan.water;
                document.getElementById('editingIndex').value = index;
                bootstrap.Tab.getOrCreateInstance(document.querySelector('[data-bs-target="#addDietTab"]')).show();
            };

            const deletePlan = (index) => {
                if (confirm("Are you sure you want to delete this plan?")) {
                    const dietPlans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
                    dietPlans.splice(index, 1);
                    localStorage.setItem('dietPlans', JSON.stringify(dietPlans));
                    renderTable();
                }
            };

            const resetForm = () => {
                document.getElementById('goalType').value = '';
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';
                document.getElementById('breakfast').value = '';
                document.getElementById('lunch').value = '';
                document.getElementById('dinner').value = '';
                document.getElementById('snacks').value = '';
                document.getElementById('water').value = '';
                document.getElementById('editingIndex').value = '';
            };

            const formatDate = (dateStr) => {
                const options = { day: '2-digit', month: 'short' };
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
            };

            // Initialize table on load
            renderTable();
