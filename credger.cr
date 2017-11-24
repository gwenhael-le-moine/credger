require "kemal"

require "./ledger"

CURRENCY = "€"
SEPARATOR = ","

ENV["PORT"] ||= "3000"

ledger = Ledger.new

# Matches GET "http://host:port/"
get "/" do |env|
  env.response.content_type = "text/html"

  send_file( env, "./public/index.html" )
end

get "/api/ledger/version" do |env|
  env.response.content_type = "text"

  ledger.version
end

get "/api/ledger/accounts" do |env|
  env.response.content_type = "application/json"

  ledger.accounts.to_json
end

get "/api/ledger/balance" do |env|
  env.response.content_type = "application/json"

  cleared = env.params.query.has_key?( "cleared" ) ? env.params.query[ "cleared" ] == "true" : false

  ledger.balance( cleared,
                  env.params.query[ "depth" ].to_i,
                  env.params.query[ "period" ],
                  env.params.query[ "categories" ] )
    .to_json
end

get "/api/ledger/graph_values" do |env|
  env.response.content_type = "application/json"

  ledger.graph_values( env.params.query["period"], env.params.query["categories"].split(" ") ).to_json
end

get "/api/ledger/register" do |env|
  env.response.content_type = "application/json"

  { key: env.params.query[ "categories" ],
    values: ledger.register( env.params.query[ "period" ],
                             env.params.query[ "categories" ].split(" ") ) }
    .to_json
end

Kemal.run( ENV["PORT"].to_i )
