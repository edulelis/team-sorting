# Team Sorting Tool

Used AI to generate part of this code.
ime spent (01h59m - including time to write documentation and prep the environment)

## How to run it

```bash
# Basic usage
npm run start -- --teams 3

# With seed for reproducible results
npm run start -- --teams 3 --seed 42

# With custom input file
npm run start -- --teams 4 --input path/to/players.csv --seed 123
```

### Command Line Options

- `--teams <number>`: Number of teams to create (required, minimum 2)
- `--seed <number>`: Random seed for reproducible results (optional)
- `--input <path>`: Path to input CSV file (default: `data/level_a_players.csv`)

## Modeling choices

To distribute teams in a way the feels "balanced" the key takeway is building an engagement metric to rank how active players are (or are likely to be in this season).  The ranking is based on these assumptions:
- Players that have been active recently are more likely to generate points
- Players that have been in the community for a long time are more likely to generate points
- Players that have been in the community for a long time have the biggest potential to generate a large volume of points
- News players shouldn't feel left out because they are competing with seasoned players, so they should feel their points matter

With this in mind, historical data amounts to roughly 60% of the weights, this way, seasoned players are highly likely to be spread around evenly.

**Tie-breaking order:** When players have identical engagement scores, teams are assigned based on activity level: less active players are placed in larger teams for better engagement opportunities, while active players use a deterministic snake draft pattern with size constraints taking priority over draft order.

**Randomness and reproducibility:** The seed controls both random tie-breaking for identical engagement scores and the initial direction of the snake draft (even seeds start forward, odd seeds start backward), providing variety while maintaining deterministic results.

## Trade-offs
- No CSV validations (missing information, invalid inputs, columns out of order)
- No tests to guarantee the balancing is fair (what would be the fairness limit and how to tune it)
- Potentially overlooked how much points matter (earn vs spent), can't make an assumpting just based on data from Level A data.


## If I had more time
- I would fine-tune the engagement metrics and revisit the weights
- Generate engagement metrics from the Level B dataset