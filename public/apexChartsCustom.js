
import ApexCharts from './apexCharts.js';

let  radialChart2, radialChart3, reportedSpamChart, linechart;

async function populateCampaignDropdown() {
    try {
        const response = await fetch('/campaigns');
        const campaigns = await response.json();

        // Sort campaigns by createdDate to find the most recent one
        campaigns.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        
        const selectElement = document.getElementById('campaign-select');
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign._id;
            option.textContent = campaign.name; // Assuming 'name' is a field in your campaign data
            selectElement.appendChild(option);
        });

        if (campaigns.length > 0) {
            selectElement.value = campaigns[0]._id;  // Set the most recent campaign as selected
            const data = await fetchCampaignData(campaigns[0]._id);
            if (data) {
                updateVisualizations(data);
            }
        }

    } catch (error) {
        console.error('Error fetching campaigns:', error);
    }
}

async function fetchCampaignData(campaignId) {
    try {
        const [aggregateStatsResponse, userActivityResponse, userActionsResponse] = await Promise.all([
            fetch(`/aggregate-user-stats/${campaignId}`),
            fetch(`/useractivity/${campaignId}`),
            fetch(`/user-actions/${campaignId}`)
        ]);

        const aggregateStats = await aggregateStatsResponse.json();
        const userActivityData = await userActivityResponse.json();
        const userActions = await userActionsResponse.json();
        console.log(userActivityData);

        return {
            aggregateStats,
            userActivityData,
            userActions
        };
    } catch (error) {
        console.error('Error fetching campaign data:', error);
    }
}


function clearChartContainer(containerId) {
    const container = document.querySelector(`#${containerId}`);
    container.innerHTML = ''; // Clear the container
}

function destroyChart(chartInstance, chartName) {
    if (chartInstance) {
        chartInstance.destroy();
    }
}

function createReportedSpamChart(containerId, reportedCount, notReportedCount) {
    destroyChart(reportedSpamChart, 'Reported Spam');
    clearChartContainer(containerId); // Clear container before creating a new chart

    const options = {
        chart: {
            type: 'pie',
            height: 350
        },
        series: [reportedCount, notReportedCount],
        labels: ['Reported Spam', 'Not Reported Spam'],
        colors: ['#ff4560', '#00e396'], // Orange and Blue
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Spam Report',
                            formatter: (w) => `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)}`,
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(2)}%`
        },
        legend: {
            position: 'bottom'
        }
    };

    reportedSpamChart = new ApexCharts(document.querySelector(`#${containerId}`), options);
    reportedSpamChart.render();
}

function createSemiCircleRadialBar(containerId, total, opened, color, label, chartInstanceVar, chartName) {
    destroyChart(chartInstanceVar, chartName);
    clearChartContainer(containerId); // Clear container before creating a new chart

    const percentage = (total > 0) ? (opened / total) * 100 : 0;
    const detailedLabel = `${opened} / ${total}`;

    const options = {
        chart: {
            type: 'radialBar',
            height: 350,
            offsetY: -20,
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: 'transparent',
                },
                track: {
                    background: '#e0e0e0',
                    strokeWidth: '100%',
                },
                dataLabels: {
                    name: {
                        offsetY: 40,
                        color: '#888',
                        fontSize: '16px',
                        formatter: () => label,
                    },
                    value: {
                        offsetY: 0,
                        color: '#333',
                        fontSize: '24px',
                        formatter: (val) => `${val}`,
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: () => detailedLabel,
                    },
                },
            },
        },
        series: [percentage],
        colors: [color],
        labels: [label],
    };

    const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
    chart.render();

    return chart;
}

function createLineChart(containerId, seriesData, xAxisCategories, chartTitle) {
    destroyChart(linechart, "line chart");
    clearChartContainer(containerId);

    const options = {
        chart: {
            type: 'line',
            height: 350
        },
        series: seriesData,
        xaxis: {
            categories: xAxisCategories,
            labels: {
                formatter: function (value) {
                    const date = new Date(value);
                    return date.toLocaleDateString(); // Format the date labels
                }
            }
        },
        title: {
            text: chartTitle
        },
        dataLabels: {
            enabled: true
        },
        stroke: {
            curve: 'smooth'
        },
        grid: {
            borderColor: '#e0e0e0'
        },
        markers: {
            size: 4
        },
        colors: ['#00e396', '#008ffb'], // Blue and Orange
        legend: {
            position: 'top'
        }
    };

    linechart = new ApexCharts(document.querySelector(`#${containerId}`), options);
    linechart.render();
}


// function createUserActions(userActions) {
//     const container = document.getElementById('userActionsContainer');

//     // Create table
//     const table = document.createElement('table');
//     table.className = 'min-w-full bg-white border border-gray-300';

//     const thead = document.createElement('thead');
//     thead.className = 'text-white';
//     thead.style.backgroundColor = "#00e396"

//     const tbody = document.createElement('tbody');

//     // Create table headers
//     const headerRow = document.createElement('tr');
//     const headers = ['Name', 'Email Opened', 'Link Opened', 'Attachment Opened', 'Submitted Data', 'Reported'];

//     headers.forEach(header => {
//         const th = document.createElement('th');
//         th.className = 'px-4 py-2 border-b border-gray-300 text-left';
//         th.innerHTML = `<div>${header}</div>`;
//         headerRow.appendChild(th);
//     });

//     thead.appendChild(headerRow);
//     table.appendChild(thead);

//     // Create table rows for each user
//     userActions.forEach(user => {
//         const row = document.createElement('tr');

//         // Name cell
//         const nameCell = document.createElement('td');
//         nameCell.className = 'px-4 py-2 border-b border-gray-300';
//         nameCell.textContent = user.name;
//         row.appendChild(nameCell);

//         // Activity cells
//         const activities = ['emailOpened', 'linkOpened', 'attachmentOpened', 'submittedData', 'reportedSpam'];

//         activities.forEach(activity => {
//             const activityCell = document.createElement('td');
//             activityCell.className = 'px-4 py-2 border-b border-gray-300 text-center';
//             const actionPerformed = user.actions[activity];
//             const cellContent = actionPerformed ? '<span class="text-green-500">✓</span>' : '<span class="text-red-500">✗</span>';
//             activityCell.innerHTML = cellContent;
//             row.appendChild(activityCell);
//         });

//         tbody.appendChild(row);
//     });

//     table.appendChild(tbody);
//     container.appendChild(table);
// }

function createUserActions(containerId, userActions) {
    // Clear the container before creating a new table
    clearChartContainer(containerId);

    const container = document.getElementById(containerId);

    // Create table
    const table = document.createElement('table');
    table.className = 'min-w-full bg-white border border-gray-300';

    const thead = document.createElement('thead');
    thead.className = 'text-white';
    thead.style.backgroundColor = "#00e396";

    const tbody = document.createElement('tbody');

    // Create table headers
    const headerRow = document.createElement('tr');
    const headers = ['Name', 'Link Opened', 'Attachment Opened', 'Reported'];

    headers.forEach(header => {
        const th = document.createElement('th');
        th.className = 'px-4 py-2 border-b border-gray-300 text-left';
        th.innerHTML = `<div>${header}</div>`;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table rows for each user
    userActions.forEach(user => {
        const row = document.createElement('tr');

        // Name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'px-4 py-2 border-b border-gray-300';
        nameCell.textContent = user.name;
        row.appendChild(nameCell);

        // Activity cells
        const activities = [ 'linkOpened', 'attachmentOpened', 'reportedSpam'];

        activities.forEach(activity => {
            const activityCell = document.createElement('td');
            activityCell.className = 'px-4 py-2 border-b border-gray-300 text-center';
            const actionPerformed = user.actions[activity];
            const cellContent = actionPerformed ? '<span class="text-green-500">✓</span>' : '<span class="text-red-500">✗</span>';
            activityCell.innerHTML = cellContent;
            row.appendChild(activityCell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}



function updateVisualizations(data) {
    const { aggregateStats, userActivityData, userActions } = data;

    // Update radial charts
    radialChart2 = createSemiCircleRadialBar('radial-chart-2', aggregateStats.totalUsers, aggregateStats.totalLinkOpenCount, '#ff4560', 'Link Open Count', radialChart2, 'Radial 2');
    radialChart3 = createSemiCircleRadialBar('radial-chart-3', aggregateStats.totalUsers, aggregateStats.totalAttachmentOpenCount, '#00e396', 'Attachment Open Count', radialChart3, 'Radial 3');
    createReportedSpamChart('reported-spam-chart', aggregateStats.reportedSpamCount, aggregateStats.notReportedSpamCount);

    // Update line chart
    createLineChart('user-activity-chart', userActivityData.seriesData, userActivityData.xAxisCategories, 'User Activity Over Time');

   
    // createUserActions(userActions);
    createUserActions('userActionsContainer', userActions);
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateCampaignDropdown();

    document.getElementById('campaign-select').addEventListener('change', async (event) => {
        const campaignId = event.target.value;
        if (campaignId) {
            const data = await fetchCampaignData(campaignId);
            if (data) {
                updateVisualizations(data);
            } else {
                console.error('No data received for campaign:', campaignId);
            }
        }
    });
});
