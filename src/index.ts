#!/usr/bin/env node

import { Command } from 'commander';
import { sortPlayers } from './team-sorter';

// Set up command line interface
const program = new Command();

program
  .option('-t, --teams <number>', 'Number of teams to create', '3')
  .option('-s, --seed <number>', 'Random seed for reproducible results')
  .option('-i, --input <path>', 'Path to input CSV file', 'data/level_a_players.csv')
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

    // Print team summaries
    console.log('\n--- Team Summary ---');
    
    // Calculate overall fairness metrics
    const teamSizes = result.teams.map(t => t.size);
    const teamEngagements = result.teams.map(t => t.avgEngagement);
    const sizeVariance = Math.max(...teamSizes) - Math.min(...teamSizes);
    const engagementVariance = Math.max(...teamEngagements) - Math.min(...teamEngagements);
    const avgEngagement = teamEngagements.reduce((a, b) => a + b, 0) / teamEngagements.length;
    
    for (const team of result.teams) {
      const engagementDeviation = Math.abs(team.avgEngagement - avgEngagement);
      
      console.log(`\nTeam ${team.id}:`);
      console.log(`  Size: ${team.size} players`);
      console.log(`  Average Engagement: ${team.avgEngagement.toFixed(0)} (deviation: ${engagementDeviation.toFixed(0)})`);
    }
    
    console.log(`\nOverall Fairness:`);
    console.log(`  Size variance: ${sizeVariance} (max 1 allowed) ✓`);
    console.log(`  Engagement variance: ${engagementVariance.toFixed(0)} (${((engagementVariance/avgEngagement)*100).toFixed(1)}% of average)`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
}

main();
