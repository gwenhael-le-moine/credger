app.service('API',
  ['$http',
    function($http) {
      let API = this;

      API.balance = function(period, categories, depth) {
        return $http.get('/api/ledger/balance', {
          params: {
            period: period,
            categories: categories,
            depth: depth
          }
        });
      };

      API.register = function(period, categories) {
        return $http.get('/api/ledger/register', {
          params: {
            period: period,
            categories: categories
          }
        });
      };

      API.graph_values = function(period, granularity, categories) {
        return $http.get('/api/ledger/graph_values', {
          params: {
            period: period,
            granularity: granularity,
            categories: categories
          }
        });
      };

      API.accounts = _.memoize(function() {
        return $http.get('/api/ledger/accounts');
      });
    }]);
