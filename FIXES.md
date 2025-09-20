- package.json
    - let's execute the code with ts-node without the need to build everytime
- index.ts, line 17: remove useless comments and params
    - make this index.ts very short, we just want the output to the mapping, nothing fancy, just
player_id → new_team
- team-sorter.ts, line 8: modified DEFAULT_WEIGHTS to weights that feel balanced instead of what the AI estimated originally, add more context to fine-tune weights
- team-sorter.ts: let's extract the engagementScore into it's own function so I can configure the weights programatically per action
- team-sorter.ts: please refactor this file and keep the engagement score function simple, no need for a dedicated class, I can pass the weights myself here directly
- team-sorter.ts, line 75, fixes to use all available data, including historical data as historical data is important to separate seasoned players to new players
- team-sorter.ts: can we separate the input building and the actual sorting logic?
    the input building should read players, build the engagement score and keep a in-mem player structure

- team-sorter.ts: can we improve the tie-breaker to put player in the bigger team with the older last_active_ts
- team-sorter.ts: last active ts is like this "2025-08-13 0:00:00" should any formatting be done?
- team-sorter.ts: let's also use the seed to change the initial direction for the drafting so there is more randomness
- on the code output: why one team is much more engaged? is it because of one player?