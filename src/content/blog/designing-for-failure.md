---
title: 'Designing for Failure'
date: '2026.05'
topic: 'Systems'
read: '8 min'
state: 'Filed'
excerpt: 'The best systems I have shipped were the ones I assumed would break on day one.'
---

Somewhere around my third production outage I stopped designing systems that were supposed to work and started designing systems that were allowed to fail. The difference sounds semantic. It isn't. One approach spends its budget on prevention. The other spends it on recovery, visibility, and graceful degradation — and recovery is a much better investment, because prevention has a ceiling and recovery doesn't.

## The three questions I ask before shipping

Before anything goes live now, I ask the same three things: what happens when this dependency times out, what happens when a human does the exact opposite of what the happy path expects, and what does the person debugging this at 3 a.m. actually see on their screen. If the answer to any of those is "I don't know," the feature isn't done, it's just untested optimism.

That third question matters more than people give it credit for. A system that fails loudly, with a clear error and a clean rollback path, is a system you can trust — even if it fails often. A system that fails silently and "mostly works" is the one that ends your week.

## Filed, not forgotten

I'm marking this one "Filed" instead of "New" because I've since run this playbook against two more projects, and it held up with one adjustment: the recovery path needs its own tests, or it quietly rots while the happy path keeps getting attention. Test the failure, not just the feature.
