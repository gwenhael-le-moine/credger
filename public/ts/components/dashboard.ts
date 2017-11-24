app.component('dashboard',
  {
    controller: ['$filter', 'API',
      function($filter, API) {
        let ctrl = this;
        ctrl.graphed_accounts = ['Expenses', 'Income'];

        let retrieve_graph_values = (period, categories) => {
          API.graph_values(period, categories)
            .then((response) => {
              ctrl.periods = [];

              _.chain(response.data)
                .reduce((memo, cat) => { return cat.length > memo.length ? cat : memo; }, [])
                .pluck('date')
                .each((date) => {
                  _(response.data).each((cat) => {
                    let value = _(cat).find({ date: date });
                    if (_(value).isUndefined()) {
                      cat.push({
                        date: date,
                        amount: 0,
                        currency: _(cat).first().currency
                      });
                    }
                  });
                });

              _(response.data).each((cat) => {
                cat = _(cat).sortBy((month) => {
                  return month.date;
                });
              });

              ctrl.graphique = {
                options: {
                  chart: {
                    type: 'multiBarChart',
                    height: 300,
                    showControls: false,
                    showLegend: true,
                    showLabels: true,
                    showValues: true,
                    showYAxis: false,

                    x: (d) => { return d.x; },
                    y: (d) => { return d.y; },
                    valueFormat: (d) => { return `${d} €`; },

                    xAxis: {
                      tickFormat: (d) => {
                        return `${d}${d == ctrl.period ? '*' : ''}`;
                      }
                    },
                    stacked: false,
                    duration: 500,
                    reduceXTicks: false,
                    rotateLabels: -67,
                    labelSunbeamLayout: true,
                    useInteractiveGuideline: true,
                    multibar: {
                      dispatch: {
                        elementClick: function(event) {
                          ctrl.period = event.data.x; // FIXME: doesn't trigger data-binding
                        }
                      }
                    }
                  }
                },
                data: _.chain(response.data)
                  .keys()
                  .reverse()
                  .map((key) => {
                    let multiplicator = (key == "Income") ? -1 : 1;
                    return {
                      key: key,
                      values: _.chain(response.data[key]).map((value) => {
                        let date = new Date(value.date);
                        let period = date.getFullYear() + '-' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
                        ctrl.periods.push(period);

                        return {
                          key: key,
                          x: period,
                          y: parseInt(value.amount) * multiplicator
                        };
                      })
                        .sortBy((item) => { return item.x; })
                        .value()
                    };
                  })
                  .value()
              };

              ctrl.periods = _.chain(ctrl.periods).uniq().sort().reverse().value();
              ctrl.period = _(ctrl.periods).first();
            });
        };

        API.accounts()
          .then((response) => {
            ctrl.raw_accounts = response.data;
            ctrl.accounts = ctrl.raw_accounts.map((account_ary) => { return account_ary.join(':'); });
          });

        retrieve_graph_values('', ctrl.graphed_accounts.join(' '));
      }
    ],

    template: `
  <div class="dashboard">
    <div class="global-graph" style="height: 300px;">
      <div class="accounts" style="width: 20%; height: 100%; float: left;">
        <select style="height: 100%;" multiple ng:model="$ctrl.graphed_accounts">
          <option ng:repeat="account in $ctrl.accounts">{{account}}</option>
        </select>
      </div>
      <div class="graph" style="width: 80%; float: left;">
        <nvd3 data="$ctrl.graphique.data"
              options="$ctrl.graphique.options">
        </nvd3>{{$ctrl.period}}
      </div>
    </div>

    <h1 style="text-align: center;">
      <select ng:options="p as p | amDateFormat:'MMMM YYYY' for p  in $ctrl.periods" ng:model="$ctrl.period"></select>
    </h1>

    <bucket categories="'Expenses Income Equity Liabilities'" period="$ctrl.period"></bucket>
  </div>
`
  });
