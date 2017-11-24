require "kemal"

require "./ledger"

CURRENCY = "€"
SEPARATOR = ","

ledger = Ledger.new

# Matches GET "http://host:port/"
get "/" do |env|
  env.response.content_type = "text/html"
  send_file env, "./public/index.html"
end

get "/api/ledger/accounts" do |env|
  env.response.content_type = "application/json"
  ledger.accounts.to_json
end

# get "/api/ledger/accounts/depth/:depth/?" do |env|
#   env.response.content_type = "application/json"
#   ledger.accounts(  ).to_json
# end

# get "/api/ledger/dates_salaries/?" do |env|
#   env.response.content_type = "application/json"
#   ledger.dates_salaries( "salaire" ).to_json
# end

# get "/api/ledger/register/?" do |env|
#   env.response.content_type = "application/json"
#   { key: params[ :categories ],
#     values: ledger.register( params[ :period ], params[ :categories ] ) }
#     .to_json
# end

get "/api/ledger/balance" do |env|
  env.response.content_type = "application/json"

  cleared = env.params.query.has_key?( "cleared" ) ? env.params.query[ "cleared" ] == "true" : false

  ledger.balance( cleared,
                  env.params.query[ "depth" ].to_i,
                  env.params.query[ "period" ],
                  env.params.query[ "categories" ] )
    .to_json
end

# get "/api/ledger/cleared/?" do |env|
#   env.response.content_type = "application/json"
#   ledger.cleared().to_json
# end

# get "/api/ledger/budget/?" do |env|
#   env.response.content_type = "application/json"
#   ledger.budget( params[ :period ],
#                  params[ :categories ] ).to_json
# end

get "/api/ledger/graph_values" do |env|
  env.response.content_type = "application/json"

  ledger.graph_values( env.params.query["period"], env.params.query["categories"].split(" ") ).to_json
  #ledger.graph_values.to_json
end

get "/api/ledger/version" do |env|
  env.response.content_type = "text"
  ledger.version
end

Kemal.run 9292
