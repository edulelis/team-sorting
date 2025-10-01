#!/usr/bin/env node

import { Command } from 'commander';
import { sortPlayers } from './team-sorter';
import { analyzeTeamBalance } from './balance-analyzer';

// Set up command line interface
const program = new Command();

program
  .option('-t, --teams <number>', 'Number of teams to create', '3')
  .option('-s, --seed <number>', 'Random seed for reproducible results')
  .option('-i, --input <path>', 'Path to input CSV file', 'data/level_a_players.csv')
  .option('-d, --detailed', 'Show detailed balance analysis')
  .parse();

const options = program.opts();

async function main() {
  try {
    // Get command line arguments
    const numTeams = parseInt(options.teams);
    const seed = options.seed ? parseInt(options.seed) : undefined;
    const inputPath = options.input;

    // Validate inputs
    if (isNaN(numTeams) || numTeams < 2) {
      console.error('Error: Number of teams must be a positive integer >= 2');
      process.exit(1);
    }

    if (seed !== undefined && isNaN(seed)) {
      console.error('Error: Seed must be a valid number');
      process.exit(1);
    }

    const result = await sortPlayers(inputPath, numTeams, seed);

    console.log('--- Player Assignments ---\n');

    // Print player assignments
    for (const [playerId, teamId] of result.mapping) {
      console.log(`${playerId} → ${teamId}`);
    }

    // Run comprehensive balance analysis
    analyzeTeamBalance(result.teams, options.detailed);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
}

main();
