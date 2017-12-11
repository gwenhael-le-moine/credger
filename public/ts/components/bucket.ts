app.component('bucket',
  {
    bindings: {
      categories: '<',
      period: '<'
    },
    controller: ['$filter', 'API',
      function($filter, API) {
        let ctrl = this;
        ctrl.depth = 99;

        ctrl.graph_options = {
          chart: {
            type: 'multiBarHorizontalChart',
            height: 600,
            margin: {
              top: 20,
              right: 20,
              bottom: 20,
              left: 200
            },
            x: (d) => { return d.account; },
            y: (d) => { return d.amount; },
            valueFormat: (d) => { return `${d} €`; },
            showYAxis: false,
            showValues: true,
            showLegend: true,
            showControls: false,
            showTooltipPercent: true,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            labelsOutside: true,
            multibar: {
              dispatch: {
                elementClick: (event) => {
                  API.register(ctrl.period, event.data.account)
                    .then(function success(response) {
                      let format_transaction = (transaction) => {
                        return `
  <tr>
    <td>${transaction.date}</td>
    <td>${transaction.payee}</td>
    <td style="text-align: right;">${transaction.amount} ${transaction.currency}</td>
  </tr>`;
                      };

                      swal({
                        title: response.data.key,
  html: `
  <table style="width: 100%;">
    <thead>
      <tr>
        <td>Date</td><td>Payee</td><td>Amount</td>
      </tr>
    </thead>
    <tbody>
      ${response.data.values.map(function(transaction) { return format_transaction(transaction); }).join("")}
    </tbody>
    <tfoot><td></td><td>Total</td><td style="text-align: right;">${event.data.amount} €</td></tfoot>
  </table>`});
                    }, function error(response) { alert("error!"); });
                }
              }
            }
          }
        };

        ctrl.$onChanges = (changes) => {
          if (changes.period && changes.period.currentValue != undefined) {
            API.balance(ctrl.period, ctrl.categories, ctrl.depth)
              .then((response) => {
                ctrl.raw_data = _(response.data)
                  .sortBy((account) => { return account.name; });

                ctrl.graph_options.chart.height = 60 + (25 * ctrl.raw_data.length);

                ctrl.data = ctrl.categories.split(' ').map((category) => {
                  return {
                    key: category,
                    values: _(ctrl.raw_data).select((line) => { return line.account.match(`^${category}:.*`); })
                  }
                })
              });
          }
        };
      }
    ],

    template: `
  <div class="bucket">
    <div class="content">
      <div class="graph">
        <nvd3 data="$ctrl.data"
              options="$ctrl.graph_options">
        </nvd3>
      </div>
    </div>
  </div>
`
  });
