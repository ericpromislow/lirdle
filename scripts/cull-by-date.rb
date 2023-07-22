#!/usr/bin/env ruby
#
# Sample command-line:
# ruby cull-by-date.rb -d 01/Apr/2023 -p positions.json access.log

require 'date'
require 'optparse'
require 'json'

options = {}

OptionParser.new do |opts|
  opts.on('-d DATE', '--date', String)
  opts.on('-p FILE', '--positions', String)
end.parse!(into: options)

def usage(msg=nil)
  puts "Usage: #{$0} [-d | --date] DD/Mon/YYYY -p positionsFile INPUTFILE"
  puts msg if msg
  exit 1
end

if !options.has_key?(:positions)
  usage("No positions file given")
elsif ARGV.size == 0
  usage("No input file given")
elsif ARGV.size >= 2
  usage("More than one input file given: <#{ ARGV }>")
elsif !File.exist? ARGV[0]
  usage("Can't find input file #{ ARGV[0] }")
end
AccessLogFile = ARGV[0]

positionsFile = options[:positions]
DATE_PTN = %r{^(\d{2})/(\w{3})/(\d{4})}
TODAY_JD =  Date.today.jd

def getJulianDate(options)
  if options.has_key?(:date)
    case options[:date]
    when DATE_PTN
      return Date.parse(options[:date]).jd
    else
      abort("Unexpected date format for #{options[:date]} -- should be DD/Mon/YYYY")
    end
  else
    return TODAY_JD
  end
end

targetJD = getJulianDate(options)

def clearPositionsData
  @positionsData = {
    'filename' => AccessLogFile,
    'firstLine' => nil,
    'offsetsByJD' => {},
    'sortedJDs' => [],
  }
end

if !File.exist?(positionsFile)
  clearPositionsData
else
  File.open(positionsFile, 'r') { |fd|
    @positionsData = JSON.load(fd)
  }
  if @positionsData['filename'].nil? || @positionsData['filename'] != AccessLogFile
    clearPositionsData
  end
end

fd = File.open(AccessLogFile, 'r')
pos = nil
firstLine = fd.readline.chomp
currentJD = nil
if firstLine != @positionsData['firstLine']
  clearPositionsData
  @positionsData['firstLine'] = firstLine
else
  # Find the position to start at
  jdIndex = nil
  if @positionsData['sortedJDs'].size == 0
    # still nil
  elsif targetJD > @positionsData['sortedJDs'][-1]
    jdIndex = @positionsData['sortedJDs'].size - 1
    currentJD = @positionsData['sortedJDs'][jdIndex]
    pos = @positionsData['offsetsByJD'][currentJD.to_s]
    # still nil
  else
    jdIndex = @positionsData['sortedJDs'].find_index {|c| c >= targetJD }
  end
  if !jdIndex.nil?
    if @positionsData['sortedJDs'][jdIndex] > targetJD
      if jdIndex > 0
        currentJD = @positionsData['sortedJDs'][jdIndex - 1]
        pos = @positionsData['offsetsByJD'][currentJD.to_s]
      end
    elsif @positionsData['sortedJDs'].size > 0
      currentJD = @positionsData['sortedJDs'][jdIndex]
      pos = @positionsData['offsetsByJD'][currentJD.to_s]
    end
  end
  if pos
    fd.seek(pos, IO::SEEK_SET)
  end
end
if pos.nil?
  fd.seek(0, IO::SEEK_SET)
end

if !@positionsData['sortedJDs'].include?(targetJD)
  ptn = %r{^[.\d]+ - - \[(\d{2}/\w{3}/\d{4})}
  begin
    while line = fd.readline.chomp
      m = ptn.match(line)
      next if !m
      jd = Date.parse(m[1]).jd
      if currentJD.nil? || currentJD < jd
        @positionsData['offsetsByJD'][jd.to_s] = fd.pos
        @positionsData['sortedJDs'] << jd
        currentJD = jd
      end
    end
  rescue EOFError
  end
end
fd.close
File.open(positionsFile, 'w') { |fd| JSON.dump(@positionsData, fd) }

jdIndex = @positionsData['sortedJDs'].find_index {|c| c == targetJD }
if jdIndex.nil?
  abort("Can't find targetJD #{ targetJD } in the positionsData ")
end
pos = @positionsData['offsetsByJD'][targetJD.to_s]
if pos.nil?
  abort("Can't find an entry for jd #{ @positionsData['offsetsByJD'][targetJD.to_s] }")
end
# We need to hop ahead by 3 days to get past most of the current date-num entries
endPos = jdIndex < @positionsData['sortedJDs'].size - 3 ? @positionsData['offsetsByJD'][(targetJD + 3).to_s] : nil

fd = File.open(ARGV[0], 'r')
fd.seek(pos, IO::SEEK_SET)
if !endPos
  while buf = fd.read(8192)
    print buf
    if buf.size < 8192
      print "\n" if buf.size == 0 || buf[-1] != "\n"
      break
    end
  end
else
  while buf = fd.read(8192)
    print buf
    if buf.size < 8192 || fd.pos >= endPos
      print "\n" if buf.size == 0 || buf[-1] != "\n"
      break
    end
  end
end
fd.close
