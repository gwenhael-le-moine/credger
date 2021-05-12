# encoding: utf-8
require "csv"

# Crystal wrapper module for calling ledger
class Ledger
  @last_mtime : Time

  def initialize( binary : String = "ledger",
                  ledger_file : String = ENV[ "LEDGER_FILE" ] ||= "#{ENV[ "HOME" ]}/org/comptes.ledger" )
    @binary = binary
    @file = ledger_file
    @last_mtime = File.info(@file).modification_time

    @cache = Hash(String, String).new
  end

  def run( options : String, command : String = "", command_parameters : String = "" ) : String
    command = "#{@binary} -f #{@file} #{options} #{command} #{command_parameters}"

    mtime = File.info(@file).modification_time
    if @last_mtime < mtime || !@cache.has_key?( command )
      @last_mtime = mtime

      @cache[ command ] = `#{command}`
    end

    @cache[ command ]
  end

  def version : String
    run "--version"
  end

  def accounts( depth : Number = 9999 ) : Array( Array( String ) )
    accounts = run( "", "accounts" )
               .split( "\n" )
               .map do |a|
      a.split( ":" )
        .each_slice( depth )
        .to_a.first
    end.uniq

    accounts.map{|a| a.size}.max.times do |i|
      accounts += accounts.map { |acc| acc.first( i ) }
    end

    accounts
      .uniq
      .sort
      .reject { |a| a.empty? || a.first.empty? }
      .sort_by { |a| a.size }
  end

  def balance( cleared : Bool = false,
               depth : Int32 = 9999,
               period : String = nil,
               categories : String = "" ) : Array( NamedTuple( account: String, amount: Float64 ) )
    period = period.nil? ? "" : "-p '#{period}'"
    depth = depth.nil? ? "" : "--depth #{depth}"
    operation = cleared ? "cleared" : "balance"

    run( "--flat --no-total --exchange '#{ENV["CREDGER_CURRENCY"]}' #{period} #{depth}", operation, categories )
      .split( "\n" )
      .reject {|line| line.empty?}
      .map do |line|
      line_array = line.split( ENV["CREDGER_CURRENCY"] )

      { account: line_array[ 1 ].strip,
        amount: line_array[ 0 ].tr( ENV["CREDGER_SEPARATOR"], "." ).to_f }
    end
  end

  def graph_values( period : String = "",
                    granularity : String = "",
                    categories : Array(String) = ["Expenses"] ) : Hash( String, Array( NamedTuple( date: String, amount: String, currency: String ) ) )
    period = period == "" ? "" : "-p '#{period}'"

    result = {} of String => Array(NamedTuple(date: String, amount: String, currency: String))
    categories.map do |category|
      result[category] = CSV
                         .parse( run( "-MAn --exchange '#{ENV["CREDGER_CURRENCY"]}' #{period} #{granularity}", "csv --no-revalued", category ) )
                         .map do |row|
        { date: row[ 0 ],
          amount: row[ 5 ],
          currency: row[ 4 ] }
      end
    end

    result
  end

  def register( period : String = "",
                categories : Array(String) = ["Expenses"] ) : Array( NamedTuple( date: String, payee: String, account: String, amount: String, currency: String ) )
    period = period == "" ? "" : "-p '#{period}'"

    CSV
      .parse( run( "--exchange '#{ENV["CREDGER_CURRENCY"]}' #{period}", "csv --no-revalued", categories.join(" ") ) )
      .map do |row|
      { date: row[ 0 ],
        payee: row[ 2 ],
        account: row[ 3 ],
        amount: row[ 5 ],
        currency: row[ 4 ] }
    end
  end
end
