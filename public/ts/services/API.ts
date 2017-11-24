app.service('API',
  ['$http',
    function($http) {
      let API = this;

      API.balance = function(params) {
        return $http.get('/api/ledger/balance', {
          params: {
            period: params.period,
            categories: params.categories,
            depth: params.depth
          }
        });
      };

      API.register = function(params) {
        return $http.get('/api/ledger/register', {
          params: {
            period: params.period,
            categories: params.categories
          }
        });
      };

      API.graph_values = function(params) {
        return $http.get('/api/ledger/graph_values', {
          params: {
            period: params.period,
            categories: params.categories
          }
        });
      };

      API.budget = function(params) {
        return $http.get('/api/ledger/budget', {
          params: {
            period: params.period,
            categories: params.categories
          }
        });
      };

      API.dates_salaries = function() {
        return $http.get('/ai/ledger/dates_salaries');
      };

      API.accounts = function() {
        return $http.get('/api/ledger/accounts');
      };

      API.cleared = function() {
        return $http.get('/api/ledger/cleared');
      };
    }]);
