require "kemal"

require "./ledger"

ENV["CREDGER_CURRENCY"] ||= "€"
ENV["CREDGER_SEPARATOR"] ||= ","

ENV["PORT"] ||= "3000"

WD = File.dirname( Process.executable_path.to_s )

ledger = Ledger.new

public_folder( "#{WD}/public" )

# Matches GET "http://host:port/"
get "/" do |env|
  env.response.content_type = "text/html"

  send_file( env, "#{WD}/public/index.html" )
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

  ledger.balance( env.params.query.has_key?( "cleared" ) ? env.params.query[ "cleared" ] == "true" : false,
                  env.params.query[ "depth" ].to_i,
                  env.params.query[ "period" ],
                  env.params.query[ "categories" ] )
    .to_json
end

get "/api/ledger/graph_values" do |env|
  env.response.content_type = "application/json"

  ledger.graph_values( env.params.query["period"],
                       "--#{env.params.query["granularity"]}",
                       env.params.query["categories"].split(" ") ).to_json
end

get "/api/ledger/register" do |env|
  env.response.content_type = "application/json"

  { key: env.params.query[ "categories" ],
    values: ledger.register( env.params.query[ "period" ],
                             env.params.query[ "categories" ].split(" ") ) }
    .to_json
end

Kemal.run( ENV["PORT"].to_i )
