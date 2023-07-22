#!/usr/bin/env ruby

require 'optparse'


IP='24.84.204.176'
def usage(msg=nil)
  puts "Usage: #{$0} [-t | --text | -j | --json] [-d | --dateNum] dateNum"
  puts msg if msg
  exit 1
end

options = {}

OptionParser.new do |opts|
  opts.on('-t', '--text')
  opts.on('-j', '--json')
  opts.on('-d NUM', '--dateNum', Integer)
end.parse!(into: options)

if !options.has_key?(:dateNum)
  usage("No date-num given")
elsif options.has_key?(:text) && options.has_key?(:json)
  usage("Specified both text and json")
end
dateNum = options[:dateNum].to_s
usage() if ARGV.size == 0

LOG='/opt/nginx/logs'

usage = {}

def id(ip, fprint)
  return "#{ip}:#{fprint}"
end

ptn = %r{^([.\d]+).*GET /usage/(.+?)\?(\S+) HTTP.*" "([^"]+)"\s*$}

started = 0
startedGame = 0
finished = 0
unfinished = 0
waiting = 0
continuing = 0
guessesNeeded = []
firstGuessCount = 0
unfinishedGuessesNeeded = []

File.readlines("#{LOG}/access.log").each do |line|
  line.chomp!
  next if line =~ %r{bentframe.org/staging}
  m = ptn.match(line)
  next if !m
  ip = m[1]
  next if ip == IP
  op = m[2]
  args = m[3].split('&')
  fprint = m[4]
  h = Hash[args.map { |x| x.split('=', 2) }]
  next if h['date'] != dateNum

  case op
  when 'start'
    started += 1
  when 'guess'
    if h['count'] == '1'
      startedGame += 1
    end
  when 'finished'
    finished += 1
    c = h['count'].to_i
    if c == 1
      firstGuessCount += 1
    else
      guessesNeeded << h['count'].to_i
    end
  when 'unfinished'
    unfinished += 1
    unfinishedGuessesNeeded << h['count'].to_i
  when 'waiting'
    waiting += 1
  when 'continue'
    continuing += 1
  end
end

def avg(a)
  return 0 if a.size == 0
  sum = a.reduce(0) { |a, b| a + b }
  "%.2f" % (sum.to_f / a.size)
end

usage = {
  loaded: started,
  started: startedGame,
  finished: finished,
  unfinished: unfinished,
  waiting: waiting,
  continuing: continuing
}

def combineStats(guesses)
  return ({
    lowest: guesses.min,
    highest: guesses.max,
    average: avg(guesses),
  })
end

if finished > 0
  usage[:finishedDetails] = combineStats(guessesNeeded)
end
if unfinished > 0
  usage[:unfinishedDetails] = combineStats(unfinishedGuessesNeeded)
end

if options[:json]
  require 'json'

  puts usage.to_json({object_nl:"\n"})
else
  puts "Loaded game: #{ usage[:loaded] }"
  puts "Started: #{ usage[:started] }"
  puts "Finished: #{ usage[:finished] }"
  puts "Percent finished: #{ (100.0 * usage[:finished] / usage[:started]).round }%" if usage[:started] > 0
  if usage[:finished] > 0
    puts "  Lowest: #{ usage[:finishedDetails][:lowest] }"
    puts "  Highest: #{ usage[:finishedDetails][:highest] }"
    puts "  Average: #{ "%.02f" % usage[:finishedDetails][:average] }"
  end
  puts "Unfinished: #{ usage[:unfinished] }"
  if unfinished > 0
    puts "  Lowest: #{ usage[:unfinishedDetails][:lowest] }"
    puts "  Highest: #{ usage[:unfinishedDetails][:highest] }"
    puts "  Average: #{ "%.02f" % usage[:unfinishedDetails][:average] }"
  end
  puts "Waiting: #{ usage[:waiting] }"
  puts "Continuing: #{ usage[:continuing] }"
end
