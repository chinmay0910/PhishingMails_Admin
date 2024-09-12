
import ApexCharts from './apexCharts.js';

let radialChart1, radialChart2, radialChart3, radialChart4, reportedSpamChart, linechart, heatmapChart;

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
        const [aggregateStatsResponse, userActivityResponse, heatmapResponse] = await Promise.all([
            fetch(`/aggregate-user-stats/${campaignId}`),
            fetch(`/useractivity/${campaignId}`),
            fetch(`/submissions-heatmap/${campaignId}`)
        ]);

        const aggregateStats = await aggregateStatsResponse.json();
        const userActivityData = await userActivityResponse.json();
        const heatmapData = await heatmapResponse.json();

        return {
            aggregateStats,
            userActivityData,
            heatmapData
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
        colors: ['#ea801c', '#1080bb'], // Orange and Blue
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
        colors: ['#1080bb', '#ea801c'], // Blue and Orange
        legend: {
            position: 'top'
        }
    };

    linechart = new ApexCharts(document.querySelector(`#${containerId}`), options);
    linechart.render();
}

function createHeatmapChart(containerId, data) {
    destroyChart(heatmapChart, 'Heatmap');
    clearChartContainer(containerId);

    const options = {
        chart: {
            type: 'heatmap',
            height: 350
        },
        dataLabels: {
            enabled: true
        },
        series: [{
            name: 'Submissions',
            data: data
        }],
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45
            }
        },
        yaxis: {
            title: {
                text: 'Number of Submissions'
            }
        },
        title: {
            text: 'User Submissions Heatmap'
        },
        colors: ['#1080bb'] // Blue
    };

    heatmapChart = new ApexCharts(document.querySelector(`#${containerId}`), options);
    heatmapChart.render();
}

function updateVisualizations(data) {
    const { aggregateStats, userActivityData, heatmapData } = data;

    // Update radial charts
    radialChart1 = createSemiCircleRadialBar('radial-chart-1', aggregateStats.totalUsers, aggregateStats.totalEmailOpenCount, '#ea801c', 'Email Open Count', radialChart1, 'Radial 1');
    radialChart2 = createSemiCircleRadialBar('radial-chart-2', aggregateStats.totalUsers, aggregateStats.totalLinkOpenCount, '#1080bb', 'Link Open Count', radialChart2, 'Radial 2');
    radialChart3 = createSemiCircleRadialBar('radial-chart-3', aggregateStats.totalUsers, aggregateStats.totalAttachmentOpenCount, '#ea801c', 'Attachment Open Count', radialChart3, 'Radial 3');
    radialChart4 = createSemiCircleRadialBar('radial-chart-4', aggregateStats.totalUsers, aggregateStats.totalSubmittedData, '#1080bb', 'Submitted Data Count', radialChart4, 'Radial 4');
    createReportedSpamChart('reported-spam-chart', aggregateStats.reportedSpamCount, aggregateStats.notReportedSpamCount);

    // Update line chart
    createLineChart('user-activity-chart', userActivityData.seriesData, userActivityData.xAxisCategories, 'User Activity Over Time');

    // Update heatmap chart
    createHeatmapChart('heatmap-chart', heatmapData);
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
