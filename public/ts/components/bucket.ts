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
            labelsOutside: true
          }
        };

        ctrl.$onChanges = (changes) => {
          if (changes.period && changes.period.currentValue != undefined) {
            API.balance({
              period: ctrl.period,
              categories: ctrl.categories,
              depth: ctrl.depth
            })
              .then((response) => {
                ctrl.raw_data = _(response.data)
                  .sortBy((account) => { return account.amount; })
                  .reverse();
                ctrl.raw_total = _(response.data).reduce((memo, account) => { return memo + account.amount; }, 0);

                ctrl.total_detailed = _.chain(ctrl.raw_data)
                  .groupBy((account) => {
                    return account.account.split(':')[0];
                  })
                  .each((category) => {
                    category.total = _(category).reduce((memo, account) => {
                      return memo + account.amount;
                    }, 0);
                  })
                  .value();
                ctrl.total_detailed = _.chain(ctrl.total_detailed)
                  .keys()
                  .map((key) => {
                    return {
                      account: key,
                      amount: ctrl.total_detailed[key].total
                    };
                  })
                  .value();

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
    <div class="tollbar">
      <span ng:repeat="account in $ctrl.total_detailed">{{account.account}} = {{account.amount | number:2}} €</span>
    </div>
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
