
      // Set max date to today for both date inputs
      document.addEventListener("DOMContentLoaded", function () {
        const today = new Date().toISOString().split("T")[0];
        document.getElementById("fromDate").setAttribute("max", today);
        document.getElementById("toDate").setAttribute("max", today);
      });

      // Show the report table and initialize DataTable without pagination, search, length dropdown, or info
      function showReportTable() {
        const container = document.getElementById("reportTableContainer");
        container.style.display = "block";

        if (!$.fn.DataTable.isDataTable("#datatable")) {
          $("#datatable").DataTable({
            responsive: true,
            paging: false,
            searching: false,
            info: false,
            lengthChange: false,
          });
        }
      }

      // Print only the report section
      function printReport() {
        window.print();
      }

      // Existing ApexCharts Scripts
      var chartPieBasicColors = getChartColorsArray("simple_pie_chart");
      chartPieBasicColors &&
        ((options = {
          series: [450000, 550000, 130000, 430000, 220000, 350000],
          chart: { height: 300, type: "pie" },
          labels: [
            "1 Month Plan",
            "3 Months Plan",
            "6 Months Plan",
            "1 Year PLan",
            "Couple Plan",
            "Custom Plan",
          ],
          legend: { position: "bottom" },
          dataLabels: { dropShadow: { enabled: false } },
          tooltip: {
            y: {
              formatter: function (val) {
                return "₹" + val.toLocaleString("en-IN");
              },
            },
          },
          colors: chartPieBasicColors,
        }),
        (chart = new ApexCharts(
          document.querySelector("#simple_pie_chart"),
          options
        )).render());

      var chartRadarBasicColors = getChartColorsArray("basic_radar");
      chartRadarBasicColors &&
        ((options = {
          series: [
            {
              name: "Revenue",
              data: [
                55000, 75000, 30000, 40000, 100000, 20000, 100000, 54000, 38000,
                500000, 98000, 240000,
              ],
            },
          ],
          chart: { height: 350, type: "radar", toolbar: { show: false } },
          colors: chartRadarBasicColors,
          xaxis: {
            categories: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ],
          },
        }),
        (chart = new ApexCharts(
          document.querySelector("#basic_radar"),
          options
        )).render());

      var areachartSplineColors = getChartColorsArray("area_chart_spline");

      if (areachartSplineColors) {
        var options = {
          series: [
            {
              name: "This Year",
              data: [120, 150, 90, 180, 200, 220, 210, 230, 240, 260, 280, 300],
            },
            {
              name: "Last Year",
              data: [100, 130, 80, 160, 170, 190, 180, 200, 210, 230, 250, 270],
            },
          ],
          chart: {
            height: 350,
            type: "area",
            toolbar: { show: false },
          },
          dataLabels: { enabled: false },
          stroke: { curve: "smooth" },
          colors: areachartSplineColors,
          xaxis: {
            type: "category",
            categories: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
          },
          yaxis: {
            min: 0,
            max: 300,
            tickAmount: 6,
            labels: {
              formatter: function (value) {
                return "₹" + value + "k";
              },
            },
          },
          tooltip: {
            y: {
              formatter: function (value) {
                return "₹" + value + "k";
              },
            },
          },
        };

        var chart = new ApexCharts(
          document.querySelector("#area_chart_spline"),
          options
        );
        chart.render();
      }

      var chartDonutBasicColors = getChartColorsArray("simple_dount_chart");

      if (chartDonutBasicColors) {
        const options = {
          series: [44, 55, 41, 17, 15],
          labels: [
            "Memberships",
            "Day Passes",
            "Merchandise",
            "Group Classes",
            "Personal Training",
          ],
          chart: {
            height: 300,
            type: "donut",
          },
          legend: { position: "bottom" },
          dataLabels: {
            dropShadow: { enabled: false },
          },
          colors: chartDonutBasicColors,
        };

        const chart = new ApexCharts(
          document.querySelector("#simple_dount_chart"),
          options
        );
        chart.render();
      }
    
function showReportTable() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  // Ensure both dates are selected
  if (!fromDate || !toDate) {
    alert("Please select both From and To dates before generating the report.");
    return;
  }

  const table = document.getElementById("datatable");
  const rows = table.querySelectorAll("tbody tr");

  let count = 0;
  rows.forEach((row) => {
    const joinDate = row.getAttribute("data-joindate");
    if (joinDate) {
      if (joinDate >= fromDate && joinDate <= toDate) {
        row.style.display = "";
        count++;
      } else {
        row.style.display = "none";
      }
    }
  });

  // Show container only after filtering
  document.getElementById("reportTableContainer").style.display = "block";

  // Reinitialize DataTable if not already done
  if (!$.fn.DataTable.isDataTable("#datatable")) {
    $("#datatable").DataTable({
      responsive: true,
      paging: false,
      searching: false,
      info: false,
      lengthChange: false,
    });
  }
}


