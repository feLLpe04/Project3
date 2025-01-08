// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Fetch the JSON data
        const response = await fetch('merged_data.json');
        const data = await response.json();
        console.log("Fetched data:", data);

        // Extract unique years from the dataset
        const years = [...new Set(data.map(item => item.Year))];
        console.log("Unique years:", years);

        // Extract unique causes from the dataset
        const causes = ["All causes", ...new Set(data.map(item => item.Cause_Name))];
        console.log("Unique causes:", causes);

        // Populate the year dropdown
        const yearDropdown = document.getElementById('yearDropdown');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearDropdown.appendChild(option);
        });

        // Populate the cause of death dropdown
        const causeDropdown = document.getElementById('causeDropdown');
        causes.forEach(cause => {
            const option = document.createElement('option');
            option.value = cause;
            option.text = cause;
            causeDropdown.appendChild(option);
        });

        // Add event listeners for dropdown changes
        yearDropdown.addEventListener('change', () => {
            const selectedYear = yearDropdown.value;
            const selectedCause = causeDropdown.value;
            updateChart(data, selectedYear, selectedCause);
        });

        causeDropdown.addEventListener('change', () => {
            const selectedYear = yearDropdown.value;
            const selectedCause = causeDropdown.value;
            updateChart(data, selectedYear, selectedCause);
        });

        // Initialize the chart with the first year and "All causes"
        if (years.length > 0) {
            updateChart(data, years[0], "All causes");
        }
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
}

// Update the pie chart based on the selected year and cause
function updateChart(data, selectedYear, selectedCause) {
    console.log("Selected year:", selectedYear);
    console.log("Selected cause:", selectedCause);

    // Filter the data based on the selected year and cause
    const filteredData = data.filter(item =>
        item.Year == selectedYear &&
        (selectedCause === "All causes" || item.Cause_Name === selectedCause)
    );
    console.log("Filtered data:", filteredData);

    // Calculate total deaths by sex
    const totals = filteredData.reduce((acc, item) => {
        acc[item.Sex] = (acc[item.Sex] || 0) + item.Total_deaths;
        return acc;
    }, {});
    console.log("Total deaths by sex:", totals);

    // Prepare data for the chart
    const labels = ['Male', 'Female', 'Undefined'];
    const values = [totals['Male'] || 0, totals['Female'] || 0, totals[''] || 0];
    const colors = ['red', 'blue', 'gray'];

    // Update the chart
    const ctx = document.getElementById('pieChart').getContext('2d');
    if (window.myPieChart) {
        window.myPieChart.destroy();
    }
    window.myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const total = values.reduce((sum, value) => sum + value, 0);
                            const percentage = ((values[tooltipItem.dataIndex] / total) * 100).toFixed(1);
                            return `${tooltipItem.label}: ${values[tooltipItem.dataIndex]} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    console.log("Updated chart with values:", values);
}

// Run the initialize function when the page loads
initializeDashboard();
