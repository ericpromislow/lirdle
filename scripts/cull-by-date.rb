#!/usr/bin/env ruby

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

DATE_PTN = %r{^(\d{2})/(\w{3})/(\d{4})}

TODAY_JD =  Date.today.jd

if options.has_key?(:date)
  case options[:date]
  when DATE_PTN
    targetJD = Date.parse(options[:date]).jd
  else
    abort("Unexpected date format for #{options[:date]} -- should be DD/Mon/YYYY")
  end
else
  targetJD = TODAY_JD
end

positionsFile = options[:positions]

def clearPositionsData
  @positionsData = {
    'filename' => nil,
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
end


if @positionsData['filename'].nil? || @positionsData['filename'] != ARGV[0]
  clearPositionsData
  @positionsData['filename'] = ARGV[0]
end

fd = File.open(ARGV[0], 'r')
pos = nil
firstLine = fd.readline.chomp
currentJD = nil
if firstLine != @positionsData['firstLine']
  clearPositionsData
  @positionsData['filename'] = ARGV[0]
  @positionsData['firstLine'] = firstLine
else
  jdIndex = @positionsData['sortedJDs'].find_index {|c| c >= targetJD }
  if !jdIndex.nil?
    if @positionsData['sortedJDs'][jdIndex] > targetJD
      if jdIndex > 0
        currentJD = @positionsData['sortedJDs'][jdIndex - 1]
        pos = @positionsData['offsetsByJD'][currentJD]
      end
    elsif @positionsData['sortedJDs'].size > 0
      currentJD = @positionsData['sortedJDs'][-1]
      pos = @positionsData['offsetsByJD'][jdIndex]
    end
  end
  if pos
    fd.seek(pos, IO::SEEK_SET)
  end
end
if pos.nil?
  fd.seek(0, IO::SEEK_SET)
end

if !@positionsData['sortedJDs'].include(targetJD)
  ptn = %r{^[.\d]+ - - (\d{2}/\w{3}/\d{4})}
  begin
    while line = fd.readline.chomp
      m = ptn.match(line)
      next if !m
      jd = Date.parse(m[1]).jd
      if currentJD.nil? || currentJD < jd
        @positionsData['offsetsByJD'][jd] = fd.pos
        @positionsData['sortedJDs'] << jd
        if jd > targetJD || targetJD == TODAY_JD
          break
        end
        currentJD = jd
      end
    end
  rescue EOFError
  end
end
fd.close
File.open(positionsFile, 'w') { |fd| JSON.dump(@positionsData, fd) }

jdIndex = @positionsData['sortedJDs'].find_index {|c| c == targetJD }
if !jdIndex.nil?
  abort("Can't find targetJD #{ targetJD } in the positionsData ")
end
pos = @positionsData['offsetsByJD'][jdIndex]
if pos.nil?
  abort("Can't find an entry for jd #{ @positionsData['offsetsByJD'][jdIndex] }")
end
endPos = jdIndex == @positionsData['sortedJDs'].size - 1 ? -1 : @positionsData['offsetsByJD'][jdIndex + 1]

fd = File.open(ARGV[0], 'r')
fd.seek(pos, IO::SEEK_SET)
if !endPos
  while buf = fd.read(8192)
    puts buf
    break if buf.size < 8192
  end
else
  while buf = fd.read(8192)
    print buf
    break if buf.size < 8192 || buf.pos >= endPos
  end
end
fd.close
