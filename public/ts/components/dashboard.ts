app.component('dashboard',
  {
    controller: ['$filter', 'API',
      function($filter, API) {
        let ctrl = this;

        ctrl.compute_selected_accounts = () => {
          ctrl.graphed_accounts = _.chain(ctrl.main_accounts_depths)
            .map((account) => {
              if (account.depth < 1) {
                return null;
              } else {
                return _(ctrl.raw_accounts)
                  .select((account2) => {
                    return account2[0] == account.name && account2.length == account.depth;
                  })
                  .map((account3) => { return account3.join(":"); });
              }
            })
            .compact()
            .flatten()
            .value();

          ctrl.retrieve_graph_values(ctrl.graphed_accounts);
        };

        ctrl.retrieve_graph_values = (categories) => {
          API.graph_values("", categories.join(" "))
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
                })
                .each((cat) => {
                  cat = _(cat).sortBy((month) => { return month.date; });
                });

              ctrl.graphique = {
                options: {
                  chart: {
                    type: 'multiBarChart',
                    height: 450,
                    stacked: true,
                    showControls: true,
                    showLegend: true,
                    showLabels: true,
                    showValues: true,
                    showYAxis: true,

                    x: (d) => { return d.x; },
                    y: (d) => { return d.y ? d.y : 0; },
                    valueFormat: (d) => { return `${d} €`; },

                    xAxis: {
                      tickFormat: (d) => {
                        return `${d}${d == ctrl.period ? '*' : ''}`;
                      }
                    },
                    duration: 500,
                    reduceXTicks: false,
                    rotateLabels: -67,
                    labelSunbeamLayout: true,
                    useInteractiveGuideline: true,
                  }
                },
                data: _.chain(response.data)
                  .keys()
                  .reverse()
                  .map((key) => {
                    return {
                      key: key,
                      values: _.chain(response.data[key])
                        .map((value) => {
                          let date = new Date(value.date);
                          let period = date.getFullYear() + '-' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
                          ctrl.periods.push(period);

                          return {
                            key: key,
                            x: period,
                            y: parseInt(value.amount)
                          };
                        })
                        .sortBy((item) => { return item.x; })
                        .value()
                    };
                  })
                  .value()
              };

              console.log(ctrl.graphique)

              ctrl.periods = _.chain(ctrl.periods).uniq().sort().reverse().value();
              ctrl.period = _(ctrl.periods).first();
            });
        };

        API.accounts()
          .then((response) => {
            ctrl.raw_accounts = response.data.sort((account) => { return account.length; }).reverse();
            ctrl.accounts = ctrl.raw_accounts.map((account_ary) => { return account_ary.join(':'); });

            ctrl.main_accounts_depths = _.chain(ctrl.raw_accounts)
              .select((account) => { return account.length == 1; })
              .map((account) => {
                return {
                  name: account[0],
                  depth: _(['Expenses', 'Income']).contains(account[0]) ? 1 : 0,
                  max_depth: _.chain(ctrl.raw_accounts)
                    .select((account2) => { return account2[0] == account[0] })
                    .reduce((memo, account3) => { return account3.length > memo ? account3.length : memo; }, 0)
                    .value()
                };
              })
              .value();

            ctrl.compute_selected_accounts();
          });
      }
    ],

    template: `
    <div class="dashboard">
<div class="global-graph" style="height: 450px;">
<div class="accounts" style="width: 20%; height: 100%; float: left;">
<ul>
<li ng:repeat="account in $ctrl.main_accounts_depths">
<label>{{account.name}} depth</label>
<rzslider rz-slider-options="{floor: 0, ceil: account.max_depth, onEnd: $ctrl.compute_selected_accounts}" rz-slider:model="account.depth"></rzslider>
</li>
</ul>
</div>

<div class="accounts" style="width: 20%; height: 100%; float: left;">
<select style="height: 100%;" multiple ng:model="$ctrl.graphed_accounts" ng:change="$ctrl.retrieve_graph_values($ctrl.graphed_accounts)">
<option ng:repeat="account in $ctrl.accounts">{{account}}</option>
</select>
</div>

<div class="graph" style="width: 60%; float: left;">
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
