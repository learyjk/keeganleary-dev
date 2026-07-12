---
title: 'Notes from Terminal 4'
date: '2026.01'
topic: 'Process'
read: '4 min'
state: 'Filed'
excerpt: 'A short log of what actually happened during the fourth rewrite of the same onboarding flow.'
---

Terminal 4 is what I nicknamed the fourth pass at an onboarding flow that kept almost shipping. Passes one through three all failed for the same boring reason: we kept designing the ideal first session instead of the median one. The median user is distracted, on a bad connection, and has already forgotten why they signed up. Design for that person and the ideal one is fine too. Design for the ideal one and the median user bounces.

## What changed on pass four

We cut the onboarding from seven steps to two, moved every optional field behind a "later" link, and stopped asking for information the product didn't need until the moment it actually needed it. None of that is a novel idea. What was new was refusing to add anything back in without a number attached to it — no feature re-entered the flow without someone showing the drop-off cost of leaving it out.

## The log entry that mattered most

The single most useful artifact from this project wasn't a Figma file, it was a plain text log of every hypothesis we tested and whether it held, kept in the repo next to the code it affected. Six months later, when someone suggested reintroducing step three "just to be safe," the log answered the question in ten seconds instead of relitigating a decision from memory. That habit is the actual reason this site keeps a running archive instead of a single "about" page.
