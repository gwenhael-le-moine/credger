app.service('API',
  ['$http',
    function($http) {
      let API = this;

      API.balance = _.memoize(function(period, categories, depth) {
        return $http.get('/api/ledger/balance', {
          params: {
            period: period,
            categories: categories,
            depth: depth
          }
        });
      });

      API.register = _.memoize(function(period, categories) {
        return $http.get('/api/ledger/register', {
          params: {
            period: period,
            categories: categories
          }
        });
      });

      API.graph_values = _.memoize(function(period, categories) {
        return $http.get('/api/ledger/graph_values', {
          params: {
            period: period,
            categories: categories
          }
        });
      });

      API.accounts = _.memoize(function() {
        return $http.get('/api/ledger/accounts');
      });
    }]);
