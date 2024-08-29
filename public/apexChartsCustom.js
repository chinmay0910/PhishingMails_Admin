import ApexCharts from './apexCharts.js'

            // Function to create a pie chart for reported spam data
            function createReportedSpamChart(containerId, reportedCount, notReportedCount) {
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
                        formatter: (val) => `${val} (${((val / (reportedCount + notReportedCount)) * 100).toFixed(1)}%)`,
                    },
                    legend: {
                        position: 'bottom'
                    }
                };

                const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
                chart.render();
            }

            // Function to create a semi-circle radial bar chart
            function createSemiCircleRadialBar(containerId, total, opened, color, label) {
                // Calculate the percentage of opened emails
                const percentage = (opened / total) * 100;
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
                                image: undefined,
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
            }

            function createLineChart(containerId, seriesData, xAxisCategories, chartTitle) {
                const options = {
                    chart: {
                        type: 'line',
                        height: 350
                    },
                    series: seriesData,
                    xaxis: {
                        categories: xAxisCategories
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

                const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
                chart.render();
            }

            function createGeoDistributionChart(containerId, data) {
                const options = {
                    chart: {
                        type: 'scatter',
                        height: 350,
                        toolbar: {
                            show: true
                        }
                    },
                    series: [{
                        name: 'User Locations',
                        data: data.map(user => ({
                            lat: user.latitude,
                            lng: user.longitude
                        }))
                    }],
                    geo: {
                        show: true,
                        map: 'world',
                        zoom: {
                            enabled: true,
                            type: 'xy'
                        },
                        background: '#f4f4f4'
                    },
                    markers: {
                        size: 5,
                        colors: ['#FF4560'],
                        hover: {
                            size: 7
                        }
                    },
                    title: {
                        text: 'Geographical Distribution of Users',
                        align: 'center'
                    },
                    tooltip: {
                        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                            const data = w.config.series[seriesIndex].data[dataPointIndex];
                            return `<div class="p-2 bg-white border rounded">
                                <strong>Location</strong><br>
                                Latitude: ${data.lat}<br>
                                Longitude: ${data.lng}
                            </div>`;
                        }
                    }
                };

                const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
                chart.render();
            }

            // Example usage of the function
            document.addEventListener('DOMContentLoaded', () => {
                // Example data
                createSemiCircleRadialBar('radial-chart-1', 120, 30, '#FF4560', 'Email Open Count');
                createSemiCircleRadialBar('radial-chart-2', 120, 10, '#00E396', 'Link Open Count');
                createSemiCircleRadialBar('radial-chart-3', 150, 75, '#FF4560', 'Attachment Open Count');
                createSemiCircleRadialBar('radial-chart-4', 150, 75, '#00E396', 'Submitted Data Count');
                createReportedSpamChart('reported-spam-chart', 30, 90);

                // Activity Graph
                const seriesData = [
                    {
                        name: 'Email Open Count',
                        data: [10, 20, 30, 40]
                    },
                    {
                        name: 'Link Open Count',
                        data: [5, 15, 25, 35]
                    }
                ];
                const xAxisCategories = ['2024-01', '2024-02', '2024-03', '2024-04'];
                const chartTitle = 'User Activity Over Time';

                createLineChart('user-activity-chart', seriesData, xAxisCategories, chartTitle);

                // Location Scatter plot
                const geoData = [
                    { latitude: 40.7128, longitude: -74.0060 }, // New York
                    { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
                    { latitude: 41.8781, longitude: -87.6298 }, // Chicago
                    { latitude: 37.7749, longitude: -122.4194 }  // San Francisco
                ];

                createGeoDistributionChart('geo-distribution-chart', geoData);
            });