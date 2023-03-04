# Intro to Lirdle

## An overview of how to play Lirdle, along with my current strategy.

At startup, you're presented with a blank screen. If you're mystified by this, I would
recommend you play Wordle for a few days first, and then come back here. This game really
assumes familiarity with Wordle and the other 5-letter-word guessing games.

![shot01](https://user-images.githubusercontent.com/108392/222923026-ff71a11f-02f8-4fd2-97db-8a499597154a.png)

So you're ready to enter your first word. If you're on a phone or tablet, you'll probably need to use the keyboard under the letter grid. Keyboards work as expected, along with standard operations for the Backspace and Enter key. Most non-alphabetic keys, like `$` are ignored.

Now, when I used to play other word games, my first word was usually `ORATE` or `ADIEU` -- the idea being to try to hit the most common letters used in English.

Lirdle is different. Lirdle is going to put exactly one lie in each line, so I start off with words that contain the less popular letters, hoping that Lirdle will lie about one of them and I can get some early truthful hits.

So I type this:

![shot02](https://user-images.githubusercontent.com/108392/222923159-0ef11242-10fa-4ea1-9868-62d4f9fd19c8.png)

press Return, and Lirdle responds with this:

![shot03](https://user-images.githubusercontent.com/108392/222923178-cdf8099a-41a8-4481-8646-125533e29fb9.png)

Awesome! I would say there's a 90% chance it's lying about the `J`. I should mention here that the lying algorithm is uniformly random: it chooses one of the characters to lie about, each with a 1/5 chance, and then it flips a virtual coin to determine which way to lie. If I was the human setting this game and answering questions, and in fact there's no `J` in this word but there is an `O`, I would be more likely to paint the `O` black to throw off my opponent. (As a useful aside, I don't think this was what Jagger and Richards had in mind with their song "Paint it Black".)

Let's go add the next four words I usually rely on to cover the alphabet:

![shot04](https://user-images.githubusercontent.com/108392/222923352-84c8e2e9-4761-4aa5-84e3-1e471e4d54ea.png)

At this point, I start clicking on the tiles to start marking which ones you think are wrong. It's not required, but lots of people have reported this helps. Click once to mark a letter a lie. Click again to mark it as true. Click it once more to clear it. Of course you can use your own assignments (like the first click marks it as true, the second as neutral, unmarked as a lie), but that would be totally bizarre. Don't do it.

So at this point I'm  pretty sure there's no `J`, there is an `O`, there's no `F`, `R`, or `D`. Lines 2 and 3 are hard -- either there are no letters in each of those lines, or there are two, and it's miscolored one of them black. We'll need more info to decide (at least I will).

The 4th line is basically a Lirdle freebie. It's colored the `Q` yellow and left the `U` black. It is possibly lying about the `U`, but then we would need a word with `Q`, `U`, `I` and `O`, and the `Q` can't be at the start. I can't think of such a word. So we mark the `Q` as the lie and go with the rest of the letters.

![shot05](https://user-images.githubusercontent.com/108392/222923531-ce1eb6d9-0039-4bbc-9a01-f5dac829bf81.png)

So my preference is not to bother marking the black letters. I figure if a black letter isn't marked as a lie, that letter probably isn't in the target word.

I'm still stuck, so I come up with a word that probes `WALTZ` to determine where the lie is:

![shot06](https://user-images.githubusercontent.com/108392/222923614-6eb83409-3655-4100-a1cc-6534320afd48.png)

A green `W` at a different spot: at least one of these is incorrect. I'm going to assume that there's no `W`.

So I need a word with `O E L` and no other letters from any of the words. I'm now thinking that there's a repeated
letter here, which makes all these guessing games harder. Time for another probe, ignoring the evidence at line 2:

![shot07](https://user-images.githubusercontent.com/108392/222923744-7dffa60d-2c73-49c7-a4ed-a042be9ae6d8.png)

It's likely lying about the second `L`, so I haven't missed anything. Notice that there are now seven rows! Lirdle will keep giving you a new blank line as long as you need it. (There's no giving up in Lirdle, but if you put it aside and come back tomorrow, you'll see what yesterday's word was. This is how newspaper crossword puzzles worked for 100 years or so and no one ever complained that they couldn't call the editor the same day for an answer. We're sticking with tradition here.)

I notice from the keyboard that there are still two letters I haven't tried yet. Sometimes I type `GROVE` to bring in the `G` and the `V`, but I'm thinking `GLOVE` or `OLIVE`.  `GLOVE` doesn't fit with the first line, because we know the `O` is in the word but at a different position. So let's try `OLIVE`:


![shot08](https://user-images.githubusercontent.com/108392/222923841-3d8afc03-fdc4-42b6-9a30-32f452f73fba.png)

It's your turn now.
