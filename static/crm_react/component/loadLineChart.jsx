import React from "react";
import { Line } from "react-chartjs-2";

function color_alpha(color, alpha) {
  alpha = alpha === undefined ? 0.5 : parseFloat(alpha);
  alpha = alpha >= 0 && alpha <= 1 ? alpha : 0.5;

  return color.replace(", 1)", ", " + alpha + ")");
}

// function LoadLineChart(props) {
//   alert("1");
//   const data = fetch("http://127.0.0.1:8000/line-chart/")
//     .then(response => response.json())
//     .then(data => {
//       debugger;
//       console.log(data);

//       console.log(data.opportunity_data);
//       console.log(data.quatations_data);
//     });

//   const brand_color = {
//     primary: "hsla(335, 74%, 51%, 1)",
//     secondary: "hsla(22, 97%, 59%, 1)",
//     salmon: "hsla(6, 93%, 71%, 1)",
//     blue: "hsla(215, 100%, 56%, 1)",
//     mante_blue: "hsla(187, 72%, 50%, 1)",
//     aubergine: "hsla(323, 92%, 34%, 1)"
//   };

//   const dash_chart_options = {
//     responsive: true,
//     animation: {
//       animateRotate: true,
//       animateScale: true
//     },
//     hover: {
//       mode: "nearest",
//       intersect: true
//     },
//     scales: {
//       xAxes: [
//         {
//           gridLines: {
//             color: "#f8f8f8",
//             display: true,
//             drawBorder: false,
//             drawOnChartArea: true,
//             drawTicks: true,
//             zeroLineColor: "#f8f8f8"
//           }
//         }
//       ],
//       yAxes: [
//         {
//           gridLines: {
//             color: "#f8f8f8",
//             display: true,
//             drawBorder: false,
//             drawOnChartArea: true,
//             drawTicks: true,
//             zeroLineColor: "#f8f8f8"
//           }
//         }
//       ]
//     },

//     legend: {
//       position: "bottom",
//       labels: {
//         boxWidth: 10
//       }
//     }
//   };

//   const dash_chart_data = {
//     labels: ["January", "February", "March", "April", "May", "June", "July"],
//     datasets: [
//       {
//         label: "Paid Invoices",
//         data: [60, 54, 75, 76, 50, 35, 40],
//         fill: false,
//         backgroundColor: brand_color.aubergine,
//         borderColor: brand_color.aubergine,
//         borderWidth: 2,
//         lineTension: 0.2,
//         pointBackgroundColor: "#fff",
//         pointRadius: 4,
//         pointHoverBackgroundColor: brand_color.aubergine,
//         pointHoverBorderColor: color_alpha(brand_color.aubergine, 0.4),
//         pointHoverBorderWidth: 20,
//         pointHoverRadius: 4
//       },
//       {
//         label: "Sales Orders",
//         data: [65, 59, 80, 81, 56, 40, 50],
//         fill: false,
//         backgroundColor: brand_color.salmon,
//         borderColor: brand_color.salmon,
//         borderWidth: 2,
//         lineTension: 0.2,
//         pointBackgroundColor: "#fff",
//         pointRadius: 4,
//         pointHoverBackgroundColor: brand_color.salmon,
//         pointHoverBorderColor: color_alpha(brand_color.salmon, 0.4),
//         pointHoverBorderWidth: 20,
//         pointHoverRadius: 4
//       },
//       {
//         label: "Quotations",
//         data: [61, 70, 83, 60, 60, 55, 70],
//         fill: false,
//         backgroundColor: brand_color.mante_blue,
//         borderColor: brand_color.mante_blue,
//         borderWidth: 2,
//         lineTension: 0.2,
//         pointBackgroundColor: "#fff",
//         pointRadius: 4,
//         pointHoverBackgroundColor: brand_color.mante_blue,
//         pointHoverBorderColor: color_alpha(brand_color.mante_blue, 0.4),
//         pointHoverBorderWidth: 20,
//         pointHoverRadius: 4
//       }
//     ]
//   };

// }

const brand_color = {
  primary: "hsla(335, 74%, 51%, 1)",
  secondary: "hsla(22, 97%, 59%, 1)",
  salmon: "hsla(6, 93%, 71%, 1)",
  blue: "hsla(215, 100%, 56%, 1)",
  mante_blue: "hsla(187, 72%, 50%, 1)",
  aubergine: "hsla(323, 92%, 34%, 1)"
};

class LoadLineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dash_chart_options: {
        responsive: true,
        animation: {
          animateRotate: true,
          animateScale: true
        },
        hover: {
          mode: "nearest",
          intersect: true
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                color: "#f8f8f8",
                display: true,
                drawBorder: false,
                drawOnChartArea: true,
                drawTicks: true,
                zeroLineColor: "#f8f8f8"
              }
            }
          ],
          yAxes: [
            {
              gridLines: {
                color: "#f8f8f8",
                display: true,
                drawBorder: false,
                drawOnChartArea: true,
                drawTicks: true,
                zeroLineColor: "#f8f8f8"
              }
            }
          ]
        },

        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10
          }
        }
      },

      dash_chart_data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July"
        ],
        datasets: [
          {
            label: "Paid Invoices",
            data: [60, 54, 75, 76, 50, 35, 40],
            fill: false,
            backgroundColor: brand_color.aubergine,
            borderColor: brand_color.aubergine,
            borderWidth: 2,
            lineTension: 0.2,
            pointBackgroundColor: "#fff",
            pointRadius: 4,
            pointHoverBackgroundColor: brand_color.aubergine,
            pointHoverBorderColor: color_alpha(brand_color.aubergine, 0.4),
            pointHoverBorderWidth: 20,
            pointHoverRadius: 4
          },
          {
            label: "Sales Orders",
            data: [65, 59, 80, 81, 56, 40, 50],
            fill: false,
            backgroundColor: brand_color.salmon,
            borderColor: brand_color.salmon,
            borderWidth: 2,
            lineTension: 0.2,
            pointBackgroundColor: "#fff",
            pointRadius: 4,
            pointHoverBackgroundColor: brand_color.salmon,
            pointHoverBorderColor: color_alpha(brand_color.salmon, 0.4),
            pointHoverBorderWidth: 20,
            pointHoverRadius: 4
          },
          {
            label: "Quotations",
            data: [61, 70, 83, 60, 60, 55, 70],
            fill: false,
            backgroundColor: brand_color.mante_blue,
            borderColor: brand_color.mante_blue,
            borderWidth: 2,
            lineTension: 0.2,
            pointBackgroundColor: "#fff",
            pointRadius: 4,
            pointHoverBackgroundColor: brand_color.mante_blue,
            pointHoverBorderColor: color_alpha(brand_color.mante_blue, 0.4),
            pointHoverBorderWidth: 20,
            pointHoverRadius: 4
          }
        ]
      }
    };
  }

  componentDidMount() {
    const data = fetch("http://127.0.0.1:8000/line-chart/")
      .then(response => response.json())
      .then(data => {
        this.setState({
          dash_chart_data: {
            labels: data.opportunity_data.opportunity_month,
            datasets: [
              {
                label: "Paid Invoices",
                data: data.opportunity_data.opportunity_amount,
                fill: false,
                backgroundColor: brand_color.aubergine,
                borderColor: brand_color.aubergine,
                borderWidth: 2,
                lineTension: 0.2,
                pointBackgroundColor: "#fff",
                pointRadius: 4,
                pointHoverBackgroundColor: brand_color.aubergine,
                pointHoverBorderColor: color_alpha(brand_color.aubergine, 0.4),
                pointHoverBorderWidth: 20,
                pointHoverRadius: 4
              },
              {
                label: "Sales Orders",
                data: data.quatations_data.quatations_amount,
                fill: false,
                backgroundColor: brand_color.salmon,
                borderColor: brand_color.salmon,
                borderWidth: 2,
                lineTension: 0.2,
                pointBackgroundColor: "#fff",
                pointRadius: 4,
                pointHoverBackgroundColor: brand_color.salmon,
                pointHoverBorderColor: color_alpha(brand_color.salmon, 0.4),
                pointHoverBorderWidth: 20,
                pointHoverRadius: 4
              },
              {
                label: "Quotations",
                data: data.quatations_data.quatations_amount,
                fill: false,
                backgroundColor: brand_color.mante_blue,
                borderColor: brand_color.mante_blue,
                borderWidth: 2,
                lineTension: 0.2,
                pointBackgroundColor: "#fff",
                pointRadius: 4,
                pointHoverBackgroundColor: brand_color.mante_blue,
                pointHoverBorderColor: color_alpha(brand_color.mante_blue, 0.4),
                pointHoverBorderWidth: 20,
                pointHoverRadius: 4
              }
            ]
          }
        });
        console.log(data);

        console.log(data.opportunity_data);
        console.log(data.quatations_data);
      });
  }

  render() {
    return (
      <div>
        <Line
          data={this.state.dash_chart_data}
          options={this.state.dash_chart_options}
        />
      </div>
    );
  }
}

export default LoadLineChart;
