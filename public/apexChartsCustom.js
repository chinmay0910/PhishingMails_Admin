
            // // Function to create a pie chart for reported spam data
            // function createReportedSpamChart(containerId, reportedCount, notReportedCount) {
            //     const options = {
            //         chart: {
            //             type: 'pie',
            //             height: 350
            //         },
            //         series: [reportedCount, notReportedCount],
            //         labels: ['Reported Spam', 'Not Reported Spam'],
            //         colors: ['#FF4560', '#00E396'],
            //         plotOptions: {
            //             pie: {
            //                 donut: {
            //                     size: '70%',
            //                     labels: {
            //                         show: true,
            //                         total: {
            //                             show: true,
            //                             label: 'Spam Report',
            //                             formatter: (w) => `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)}`,
            //                         }
            //                     }
            //                 }
            //             }
            //         },
            //         dataLabels: {
            //             enabled: true,
            //             formatter: (val) => `${val} (${((val / (reportedCount + notReportedCount)) * 100).toFixed(1)}%)`,
            //         },
            //         legend: {
            //             position: 'bottom'
            //         }
            //     };

            //     const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
            //     chart.render();
            // }

            // // Function to create a semi-circle radial bar chart
            // function createSemiCircleRadialBar(containerId, total, opened, color, label) {
            //     // Calculate the percentage of opened emails
            //     const percentage = (opened / total) * 100;
            //     const detailedLabel = `${opened} / ${total}`;

            //     const options = {
            //         chart: {
            //             type: 'radialBar',
            //             height: 350,
            //             offsetY: -20,
            //         },
            //         plotOptions: {
            //             radialBar: {
            //                 startAngle: -90,
            //                 endAngle: 90,
            //                 hollow: {
            //                     margin: 0,
            //                     size: '70%',
            //                     background: 'transparent',
            //                     image: undefined,
            //                 },
            //                 track: {
            //                     background: '#e0e0e0',
            //                     strokeWidth: '100%',
            //                 },
            //                 dataLabels: {
            //                     name: {
            //                         offsetY: 40,
            //                         color: '#888',
            //                         fontSize: '16px',
            //                         formatter: () => label,
            //                     },
            //                     value: {
            //                         offsetY: 0,
            //                         color: '#333',
            //                         fontSize: '24px',
            //                         formatter: (val) => `${val}`,
            //                     },
            //                     total: {
            //                         show: true,
            //                         label: 'Total',
            //                         formatter: () => detailedLabel,
            //                     },
            //                 },
            //             },
            //         },
            //         series: [percentage],
            //         colors: [color],
            //         labels: [label],
            //     };

            //     const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
            //     chart.render();
            // }

            // function createLineChart(containerId, seriesData, xAxisCategories, chartTitle) {
            //     const options = {
            //         chart: {
            //             type: 'line',
            //             height: 350
            //         },
            //         series: seriesData,
            //         xaxis: {
            //             categories: xAxisCategories
            //         },
            //         title: {
            //             text: chartTitle
            //         },
            //         dataLabels: {
            //             enabled: true
            //         },
            //         stroke: {
            //             curve: 'smooth'
            //         },
            //         grid: {
            //             borderColor: '#e0e0e0'
            //         },
            //         markers: {
            //             size: 4
            //         },
            //         legend: {
            //             position: 'top'
            //         }
            //     };

            //     const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
            //     chart.render();
            // }

            // function createGeoDistributionChart(containerId, data) {
            //     const options = {
            //         chart: {
            //             type: 'scatter',
            //             height: 350,
            //             toolbar: {
            //                 show: true
            //             }
            //         },
            //         series: [{
            //             name: 'User Locations',
            //             data: data.map(user => ({
            //                 lat: user.latitude,
            //                 lng: user.longitude
            //             }))
            //         }],
            //         geo: {
            //             show: true,
            //             map: 'world',
            //             zoom: {
            //                 enabled: true,
            //                 type: 'xy'
            //             },
            //             background: '#f4f4f4'
            //         },
            //         markers: {
            //             size: 5,
            //             colors: ['#FF4560'],
            //             hover: {
            //                 size: 7
            //             }
            //         },
            //         title: {
            //             text: 'Geographical Distribution of Users',
            //             align: 'center'
            //         },
            //         tooltip: {
            //             custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            //                 const data = w.config.series[seriesIndex].data[dataPointIndex];
            //                 return `<div class="p-2 bg-white border rounded">
            //                     <strong>Location</strong><br>
            //                     Latitude: ${data.lat}<br>
            //                     Longitude: ${data.lng}
            //                 </div>`;
            //             }
            //         }
            //     };

            //     const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
            //     chart.render();
            // }

            // // Example usage of the function
            // document.addEventListener('DOMContentLoaded', () => {
            //     // Example data
            //     createSemiCircleRadialBar('radial-chart-1', 120, 30, '#FF4560', 'Email Open Count');
            //     createSemiCircleRadialBar('radial-chart-2', 120, 10, '#00E396', 'Link Open Count');
            //     createSemiCircleRadialBar('radial-chart-3', 150, 75, '#FF4560', 'Attachment Open Count');
            //     createSemiCircleRadialBar('radial-chart-4', 150, 75, '#00E396', 'Submitted Data Count');
            //     createReportedSpamChart('reported-spam-chart', 30, 90);

            //     // Activity Graph
            //     const seriesData = [
            //         {
            //             name: 'Email Open Count',
            //             data: [10, 20, 30, 40]
            //         },
            //         {
            //             name: 'Link Open Count',
            //             data: [5, 15, 25, 35]
            //         }
            //     ];
            //     const xAxisCategories = ['2024-01', '2024-02', '2024-03', '2024-04'];
            //     const chartTitle = 'User Activity Over Time';

            //     createLineChart('user-activity-chart', seriesData, xAxisCategories, chartTitle);

            //     // Location Scatter plot
            //     const geoData = [
            //         { latitude: 40.7128, longitude: -74.0060 }, // New York
            //         { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
            //         { latitude: 41.8781, longitude: -87.6298 }, // Chicago
            //         { latitude: 37.7749, longitude: -122.4194 }  // San Francisco
            //     ];

            //     createGeoDistributionChart('geo-distribution-chart', geoData);
            // });


            // import ApexCharts from './apexCharts.js'

            // let radialChart1, radialChart2, radialChart3, radialChart4, reportedSpamChart;
            
            // async function populateCampaignDropdown() {
            //     try {
            //         const response = await fetch('/campaigns');
            //         const campaigns = await response.json();
            //         console.log(campaigns);
            
            //         const selectElement = document.getElementById('campaign-select');
            //         campaigns.forEach(campaign => {
            //             const option = document.createElement('option');
            //             option.value = campaign._id;
            //             option.textContent = campaign.name; // Assuming 'name' is a field in your campaign data
            //             selectElement.appendChild(option);
            //         });
            //     } catch (error) {
            //         console.error('Error fetching campaigns:', error);
            //     }
            // }
            
            // async function fetchCampaignData(campaignId) {
            //     try {
            //         const response = await fetch(`/aggregate-user-stats/${campaignId}`);
            //         return await response.json();
            //     } catch (error) {
            //         console.error('Error fetching campaign data:', error);
            //     }
            // }
            
            // function createReportedSpamChart(containerId, reportedCount, notReportedCount) {
            //     if (reportedSpamChart) reportedSpamChart.destroy(); // Destroy previous chart if exists
            
            //     const options = {
            //         chart: {
            //             type: 'pie',
            //             height: 350
            //         },
            //         series: [reportedCount, notReportedCount],
            //         labels: ['Reported Spam', 'Not Reported Spam'],
            //         colors: ['#FF4560', '#00E396'],
            //         plotOptions: {
            //             pie: {
            //                 donut: {
            //                     size: '70%',
            //                     labels: {
            //                         show: true,
            //                         total: {
            //                             show: true,
            //                             label: 'Spam Report',
            //                             formatter: (w) => `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)}`,
            //                         }
            //                     }
            //                 }
            //             }
            //         },
            //         dataLabels: {
            //             enabled: true,
            //             formatter: (val) => `${val} (${((val / (reportedCount + notReportedCount)) * 100).toFixed(1)}%)`,
            //         },
            //         legend: {
            //             position: 'bottom'
            //         }
            //     };
            
            //     reportedSpamChart = new ApexCharts(document.querySelector(`#${containerId}`), options);
            //     reportedSpamChart.render();
            // }
            
            // function createSemiCircleRadialBar(containerId, total, opened, color, label, chartInstanceVar) {
            //     if (chartInstanceVar) chartInstanceVar.destroy(); // Destroy previous chart if exists
            
            //     const percentage = (opened / total) * 100;
            //     const detailedLabel = `${opened} / ${total}`;
            
            //     const options = {
            //         chart: {
            //             type: 'radialBar',
            //             height: 350,
            //             offsetY: -20,
            //         },
            //         plotOptions: {
            //             radialBar: {
            //                 startAngle: -90,
            //                 endAngle: 90,
            //                 hollow: {
            //                     margin: 0,
            //                     size: '70%',
            //                     background: 'transparent',
            //                 },
            //                 track: {
            //                     background: '#e0e0e0',
            //                     strokeWidth: '100%',
            //                 },
            //                 dataLabels: {
            //                     name: {
            //                         offsetY: 40,
            //                         color: '#888',
            //                         fontSize: '16px',
            //                         formatter: () => label,
            //                     },
            //                     value: {
            //                         offsetY: 0,
            //                         color: '#333',
            //                         fontSize: '24px',
            //                         formatter: (val) => `${val}`,
            //                     },
            //                     total: {
            //                         show: true,
            //                         label: 'Total',
            //                         formatter: () => detailedLabel,
            //                     },
            //                 },
            //             },
            //         },
            //         series: [percentage],
            //         colors: [color],
            //         labels: [label],
            //     };
            
            //     chartInstanceVar = new ApexCharts(document.querySelector(`#${containerId}`), options);
            //     chartInstanceVar.render();
            // }
            
            // function updateVisualizations(data) {
            //     createSemiCircleRadialBar('radial-chart-1', data.totalUsers, data.totalEmailOpenCount, '#FF4560', 'Email Open Count', radialChart1);
            //     createSemiCircleRadialBar('radial-chart-2', data.totalUsers, data.totalLinkOpenCount, '#00E396', 'Link Open Count', radialChart2);
            //     createSemiCircleRadialBar('radial-chart-3', data.totalUsers, data.totalAttachmentOpenCount, '#FF4560', 'Attachment Open Count', radialChart3);
            //     createSemiCircleRadialBar('radial-chart-4', data.totalUsers, data.totalSubmittedData, '#00E396', 'Submitted Data Count', radialChart4);
            //     createReportedSpamChart('reported-spam-chart', data.reportedSpamCount, data.notReportedSpamCount);
            
            //     // Example for Line Chart and Geo Distribution Chart can be added similarly based on your data
            // }
            
            // document.addEventListener('DOMContentLoaded', async () => {
            //     await populateCampaignDropdown();
            
            //     document.getElementById('campaign-select').addEventListener('change', async (event) => {
            //         const campaignId = event.target.value;
            //         if (campaignId) {
            //             const data = await fetchCampaignData(campaignId);
            //             console.log(data);
            //             updateVisualizations(data);
            //         }
            //     });
            // });
           


            import ApexCharts from './apexCharts.js';

let radialChart1, radialChart2, radialChart3, radialChart4, reportedSpamChart, linechart, heatmapChart;

async function populateCampaignDropdown() {
    try {
        const response = await fetch('/campaigns');
        const campaigns = await response.json();
        
        const selectElement = document.getElementById('campaign-select');
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign._id;
            option.textContent = campaign.name; // Assuming 'name' is a field in your campaign data
            selectElement.appendChild(option);
        });
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
        colors: ['#FF4560', '#00E396'],
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
        colors: ['#00E396']
    };

    heatmapChart = new ApexCharts(document.querySelector(`#${containerId}`), options);
    heatmapChart.render();
}

function updateVisualizations(data) {
    const { aggregateStats, userActivityData, heatmapData } = data;

    // Update radial charts
    radialChart1 = createSemiCircleRadialBar('radial-chart-1', aggregateStats.totalUsers, aggregateStats.totalEmailOpenCount, '#FF4560', 'Email Open Count', radialChart1, 'Radial 1');
    radialChart2 = createSemiCircleRadialBar('radial-chart-2', aggregateStats.totalUsers, aggregateStats.totalLinkOpenCount, '#00E396', 'Link Open Count', radialChart2, 'Radial 2');
    radialChart3 = createSemiCircleRadialBar('radial-chart-3', aggregateStats.totalUsers, aggregateStats.totalAttachmentOpenCount, '#FF4560', 'Attachment Open Count', radialChart3, 'Radial 3');
    radialChart4 = createSemiCircleRadialBar('radial-chart-4', aggregateStats.totalUsers, aggregateStats.totalSubmittedData, '#00E396', 'Submitted Data Count', radialChart4, 'Radial 4');
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
