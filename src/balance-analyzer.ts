import { TeamInfo } from './types';

/**
 * Analyzes and displays team balance information
 * @param teams - Array of team information from the sorting result
 * @param showDetails - Whether to show detailed player breakdowns (default: false)
 */
export function analyzeTeamBalance(teams: TeamInfo[], showDetails: boolean = false): void {
  console.log('\n=== TEAM BALANCE ANALYSIS ===\n');

  // Calculate overall statistics
  const teamSizes = teams.map(t => t.size);
  const teamEngagements = teams.map(t => t.avgEngagement);
  const totalPlayers = teamSizes.reduce((sum, size) => sum + size, 0);
  const avgTeamSize = totalPlayers / teams.length;
  const avgEngagement = teamEngagements.reduce((sum, eng) => sum + eng, 0) / teamEngagements.length;

  // Calculate variance metrics
  const sizeVariance = Math.max(...teamSizes) - Math.min(...teamSizes);
  const engagementVariance = Math.max(...teamEngagements) - Math.min(...teamEngagements);
  const engagementStdDev = calculateStandardDeviation(teamEngagements, avgEngagement);

  // Display team size distribution
  console.log('📊 TEAM SIZE DISTRIBUTION:');
  teams.forEach(team => {
    const sizeDeviation = team.size - avgTeamSize;
    const sizeStatus = Math.abs(sizeDeviation) <= 1 ? '✅' : '❌';
    console.log(`  Team ${team.id}: ${team.size} players (${sizeDeviation >= 0 ? '+' : ''}${sizeDeviation.toFixed(1)}) ${sizeStatus}`);
  });
  console.log(`  Size variance: ${sizeVariance} (max 1 allowed) ${sizeVariance <= 1 ? '✅' : '❌'}\n`);

  // Display engagement distribution
  console.log('⚖️  ENGAGEMENT DISTRIBUTION:');
  teams.forEach(team => {
    const engagementDeviation = team.avgEngagement - avgEngagement;
    const deviationPercent = (engagementDeviation / avgEngagement) * 100;
    const status = Math.abs(deviationPercent) < 5 ? '✅' : Math.abs(deviationPercent) < 10 ? '⚠️' : '❌';
    console.log(`  Team ${team.id}: ${team.avgEngagement.toFixed(0)} (${deviationPercent >= 0 ? '+' : ''}${deviationPercent.toFixed(1)}%) ${status}`);
  });
  console.log(`  Engagement variance: ${engagementVariance.toFixed(0)} (${((engagementVariance/avgEngagement)*100).toFixed(1)}% of average)`);
  console.log(`  Standard deviation: ${engagementStdDev.toFixed(0)}\n`);

  // Display top players per team
  console.log('🏆 TOP PLAYERS PER TEAM:');
  teams.forEach(team => {
    const topPlayers = team.players
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 3);
    
    console.log(`  Team ${team.id}:`);
    topPlayers.forEach((player, index) => {
      const rank = ['🥇', '🥈', '🥉'][index];
      console.log(`    ${rank} Player ${player.id}: ${player.engagementScore.toLocaleString()} points`);
    });
  });

  // Display fairness assessment
  console.log('\n📈 FAIRNESS ASSESSMENT:');
  const sizeFairness = sizeVariance <= 1 ? 'EXCELLENT' : sizeVariance <= 2 ? 'GOOD' : 'POOR';
  const maxDeviationPercent = Math.max(...teams.map(t => Math.abs(t.avgEngagement - avgEngagement) / avgEngagement * 100));
  const engagementFairness = maxDeviationPercent < 5 ? 'EXCELLENT' : maxDeviationPercent < 10 ? 'GOOD' : 'POOR';
  
  console.log(`  Team size balance: ${sizeFairness} (variance: ${sizeVariance})`);
  console.log(`  Engagement balance: ${engagementFairness} (max deviation: ${Math.max(...teams.map(t => Math.abs(t.avgEngagement - avgEngagement))).toFixed(0)})`);
  
  // Overall assessment
  const overallFairness = sizeVariance <= 1 && maxDeviationPercent < 10 ? 'EXCELLENT' : 
                         sizeVariance <= 2 && maxDeviationPercent < 20 ? 'GOOD' : 'NEEDS IMPROVEMENT';
  console.log(`  Overall fairness: ${overallFairness}`);

  // Detailed analysis if requested
  if (showDetails) {
    console.log('\n🔍 DETAILED ANALYSIS:');
    
    // Engagement score distribution
    const allScores = teams.flatMap(t => t.players.map(p => p.engagementScore));
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);
    const scoreRange = maxScore - minScore;
    
    console.log(`  Engagement score range: ${minScore.toLocaleString()} - ${maxScore.toLocaleString()} (span: ${scoreRange.toLocaleString()})`);
    
    // Team engagement distribution
    teams.forEach(team => {
      const teamScores = team.players.map(p => p.engagementScore);
      const teamMin = Math.min(...teamScores);
      const teamMax = Math.max(...teamScores);
      const teamRange = teamMax - teamMin;
      
      console.log(`  Team ${team.id} score range: ${teamMin.toLocaleString()} - ${teamMax.toLocaleString()} (span: ${teamRange.toLocaleString()})`);
    });
  }

  console.log('\n=== END ANALYSIS ===\n');
}

/**
 * Calculates the standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[], mean: number): number {
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}
