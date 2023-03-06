#!/usr/bin/env ruby

def usage(msg=nil)
  puts "Usage: #{$0} dateNum"
  puts msg if msg
  exit 1
end

usage() if ARGV.size == 0
dateNum = ARGV[0]

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
  sum.to_f / a.size
end

puts "Loaded game: #{ started }"
puts "Started: #{ startedGame }"
puts "Finished: #{ finished }"
if finished > 0
  puts "Lowest: #{ guessesNeeded.min }"
  puts "Highest: #{ guessesNeeded.max }"
  puts "Average: #{ avg(guessesNeeded) }"
end
puts "Unfinished: #{ unfinished }"
if unfinished > 0
  puts "Lowest: #{ unfinishedGuessesNeeded.min }"
  puts "Highest: #{ unfinishedGuessesNeeded.max }"
  puts "Average: #{ avg(unfinishedGuessesNeeded) }"
end
puts "Waiting: #{ waiting }"
puts "Continuing: #{ continuing }"
