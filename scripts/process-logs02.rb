#!/usr/bin/env ruby

require 'optparse'
require 'json'

options = {}

OptionParser.new do |opts|
  opts.on('-t', '--text')
  opts.on('-j', '--json')
  opts.on('-d NUM', '--dateNum', Integer)
  opts.on('-p FILE', '--positions', String)
end.parse!(into: options)

def usage(msg=nil)
  puts "Usage: #{$0} [-t | --text | -j | --json] [-d | --dateNum] -p positionsFile"
  puts msg if msg
  exit 1
end

if !options.has_key?(:dateNum)
  usage("No date-num given")
elsif options.has_key?(:text) && options.has_key?(:json)
  usage("Specified both text and json")
elsif !options.has_key?(:positions)
  usage("No positions file given")
end
dateNumInt = options[:dateNum].to_i
positionsFile = options[:positions]

if !File.exist?(positionsFile)
  @positionsData = {
    'firstLine' => nil,
    'offsets' => [nil] * dateNumInt,
    'firstOffset' => 0,
  }
else
  File.open(positionsFile, 'r') { |fd|
    @positionsData = JSON.load(fd)
  }
end

LOG='/opt/nginx/logs'

# usage = {}

ptn = %r{^([.\d]+).*GET /usage/(.+?)\?(\S+) HTTP.*" "[^"]+"\s*$}

started = 0
startedGame = 0
finished = 0
unfinished = 0
waiting = 0
continuing = 0
guessesNeeded = []
firstGuessCount = 0
unfinishedGuessesNeeded = []

fd = File.open("#{LOG}/access.log", 'r')

pos = nil
firstLine = fd.readline.chomp
if firstLine == @positionsData['firstLine']
  pos = @positionsData['offsets'][dateNumInt]
  if !pos
    possibleIdx = dateNumInt - 1
    while possibleIdx > 0 && @positionsData['offsets'][possibleIdx].nil?
      possibleIdx -= 1
    end
    if possibleIdx >= 0
      pos = @positionsData['offsets'][possibleIdx]
    end
  end
  if pos
    fd.seek(pos, IO::SEEK_SET)
  end
else
  @positionsData[:firstLine] = firstLine
  @positionsData['offsets'] = [nil] * dateNumInt
  @positionsData[:firstOffset] = 0
  fd.seek(0, IO::SEEK_SET)
end

begin
while line = fd.readline.chomp
  next if line =~ %r{bentframe.org/staging}
  m = ptn.match(line)
  next if !m
  ip = m[1]
  next if ENV['MYIP'] && ENV['MYIP'].split(',').include?(ip)
  op = m[2]
  args = m[3].split('&')
  h = Hash[args.map { |x| x.split('=', 2) }]
  next if !h.has_key?('date')
  thisDateNum = h['date'].to_i
  if thisDateNum > 20230218
    thisDateNum -= 20230218
  elsif thisDateNum > dateNumInt + 10
    # Forget it...
    next
  end
  if @positionsData['offsets'][thisDateNum].nil?
    @positionsData['offsets'][thisDateNum] = fd.pos
    if @positionsData[:firstOffset].nil?
      @positionsData[:firstOffset] = thisDateNum
    end
  end
  if thisDateNum != dateNumInt
    next
  end

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
rescue EOFError
end
File.open(positionsFile, 'w') { |fd| JSON.dump(@positionsData, fd) }

def avg(a)
  return 0 if a.size == 0
  sum = a.reduce(0) { |a, b| a + b }
  sum.to_f / a.size
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
