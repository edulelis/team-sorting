Help me construct the building blocks to a Node project with the following requirements.

A script/program (TypeScript/Node preferred; Python etc. allowed) that:
Takes the number of teams as an input (example: --teams 3).
Outputs a mapping of player_id → new_team.
Prints a short summary per team: team size plus one fairness stat of your choice, and a 1-2 sentence justification for why it helps a user trust the shuffle.
How we expect to run:
We should be able to run something like:
npm start -- --teams 3 --seed 42
If your code uses any random tie-breaking, also support an optional seed number so the result is repeatable


Only create the initial template to execute the node commands and parse args.