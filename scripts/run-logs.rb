#!/usr/bin/env ruby

# No args necessary -- runs logs for the last 2 days
# Run logs for yesterday for people playing today's game
# Run logs for today for people playing tomorrow's game

require 'date'

d = Date.today
dStart = Date.parse("2023-02-18")
dStartDay = dStart.jd
dNowDay = d.jd
dCurrentGameNum = dNowDay - dStartDay

gameNumRange = (dCurrentGameNum - 1 .. dCurrentGameNum + 1)

gameNumRange.each do |gameNum|
  cmd = "ruby #{ ENV.fetch('SCRIPTHOME') }/process-logs01.rb --json --dateNum #{gameNum} > /tmp/details.txt && mv /tmp/details.txt #{ ENV.fetch('STATHOME') }/day#{ '%04d' % gameNum }.json"
#  puts "Running cmd #{ cmd }"
  puts `#{ cmd }`
end
