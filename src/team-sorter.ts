import * as fs from 'fs';
import { TeamSortResult, Player, TeamInfo } from './types';

/**
 * Default weights for the engagement score
 * Includes both current activity and historical engagement
 */
const DEFAULT_WEIGHTS = {
  currentTotalPoints: 4,        // Current points (always ≤ historical earned)
  daysActiveLast30:   20,       // Recent activity indicator
  currentStreakValue: 10,       // Current engagement streak
  

  historicalPointsEarned:       3,     // Total points earned over time (main engagement metric)
  historicalPointsSpent:        2,   // Points spent (shows engagement)
  historicalEventsParticipated: 10,    // Unique events joined (community involvement)
  historicalEventEngagements:   5,    // Total interactions across events (engagement quality)
  historicalMessagesSent:       2,     // Public chat (social interaction)
};

/**
 * Main function: takes a CSV file and sorts players into balanced teams
 * @param inputPath - path to the CSV file with player data
 * @param numTeams - how many teams to create
 * @param seed - optional random seed for reproducible results
 * @returns mapping of player_id -> team_id
 */
export async function sortPlayers(
  inputPath: string, 
  numTeams: number, 
  seed?: number
): Promise<TeamSortResult> {
  // Step 1: Set random seed if provided (for reproducible results)
  if (seed !== undefined) {
    setRandomSeed(seed);
  }

  const players = buildPlayerData(inputPath);
  // Sort players by engagement score (highest first), with random tie-breaking
  const sortedPlayers = players.sort((a, b) => {
    if (b.engagementScore !== a.engagementScore) {
      return b.engagementScore - a.engagementScore;
    }
    // For identical engagement scores, use random tie-breaking
    return Math.random() - 0.5;
  });
  const mapping = createBalancedTeams(sortedPlayers, numTeams, seed);
  const teams = buildTeamInfo(sortedPlayers, mapping, numTeams);

  return { mapping, teams };
}

/**
 * Builds player data from CSV file with engagement scores
 * @param filePath - path to the CSV file
 * @returns array of players with engagement scores
 */
export function buildPlayerData(filePath: string): Player[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  const players: Player[] = [];
  
  // Skip the header row (index 0), start from row 1
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',');
    
    // Extract all player data from CSV columns
    const historicalEventsParticipated = parseInt(columns[0]);
    const historicalEventEngagements = parseInt(columns[1]);
    const historicalPointsEarned = parseInt(columns[2]);
    const historicalPointsSpent = parseInt(columns[3]);
    const historicalMessagesSent = parseInt(columns[4]);
    const currentTotalPoints = parseInt(columns[5]);
    const daysActiveLast30 = parseInt(columns[6]);
    const currentStreakValue = parseInt(columns[7]);
    const lastActiveTs = columns[8];
    const currentTeam = parseInt(columns[9]);
    const currentTeamName = columns[10];
    const playerId = parseInt(columns[11]);
    
    // Calculate comprehensive engagement score using all historical data
    const engagementScore = 
      (currentTotalPoints * DEFAULT_WEIGHTS.currentTotalPoints) +
      (daysActiveLast30 * DEFAULT_WEIGHTS.daysActiveLast30) +
      (currentStreakValue * DEFAULT_WEIGHTS.currentStreakValue) +
      
      (historicalPointsEarned * DEFAULT_WEIGHTS.historicalPointsEarned) +
      (historicalPointsSpent * DEFAULT_WEIGHTS.historicalPointsSpent) +
      (historicalEventsParticipated * DEFAULT_WEIGHTS.historicalEventsParticipated) +
      (historicalEventEngagements * DEFAULT_WEIGHTS.historicalEventEngagements) +
      (historicalMessagesSent * DEFAULT_WEIGHTS.historicalMessagesSent);
    
    players.push({
      id: playerId,
      engagementScore: Math.round(engagementScore),
      currentTeam: currentTeam,
      currentTeamName: currentTeamName,
      historicalEventsParticipated: historicalEventsParticipated,
      historicalEventEngagements: historicalEventEngagements,
      historicalPointsEarned: historicalPointsEarned,
      historicalPointsSpent: historicalPointsSpent,
      historicalMessagesSent: historicalMessagesSent,
      currentTotalPoints: currentTotalPoints,
      daysActiveLast30: daysActiveLast30,
      currentStreakValue: currentStreakValue,
      lastActiveTs: lastActiveTs
    });
  }
  
  return players;
}

/**
 * Builds team information for summary display
 * @param players - all players with their data
 * @param mapping - player_id -> team_id mapping
 * @param numTeams - number of teams
 * @returns array of team information
 */
function buildTeamInfo(players: Player[], mapping: Map<number, number>, numTeams: number): TeamInfo[] {
  const teams: TeamInfo[] = [];
  
  // Initialize teams
  for (let i = 1; i <= numTeams; i++) {
    teams.push({
      id: i,
      size: 0,
      totalEngagement: 0,
      avgEngagement: 0,
      players: []
    });
  }
  
  // Group players by team
  for (const player of players) {
    const teamId = mapping.get(player.id);
    if (teamId !== undefined) {
      const team = teams[teamId - 1];
      team.players.push(player);
      team.size++;
      team.totalEngagement += player.engagementScore;
    }
  }
  
  // Calculate average engagement for each team
  for (const team of teams) {
    team.avgEngagement = team.size > 0 ? team.totalEngagement / team.size : 0;
  }
  
  return teams;
}

/**
 * Creates balanced teams using a size-aware snake draft approach
 * This ensures high-engagement players are distributed evenly across teams
 * while keeping team sizes as equal as possible (max 1 player difference)
 */
function createBalancedTeams(players: Player[], numTeams: number, seed?: number): Map<number, number> {
  const mapping = new Map<number, number>();
  const teamScores = new Array(numTeams).fill(0); // Track total engagement per team
  const teamSizes = new Array(numTeams).fill(0); // Track team sizes
  
  // Calculate target team size and max allowed size
  const totalPlayers = players.length;
  const baseTeamSize = Math.floor(totalPlayers / numTeams);
  const maxTeamSize = baseTeamSize + 1;
  
  // Determine initial direction based on seed (for more randomness)
  const startForward = seed !== undefined ? (seed % 2 === 0) : true;
  
  // Snake draft with size constraints
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    
    // Determine which team gets this player using snake draft from the start
    let teamIndex: number;
    
    const round = Math.floor(i / numTeams);
    const positionInRound = i % numTeams;
    
    // Determine direction based on round and initial direction
    const isEvenRound = round % 2 === 0;
    const shouldGoForward = startForward ? isEvenRound : !isEvenRound;
    
    if (shouldGoForward) {
      // Forward direction (0, 1, 2, 3...)
      teamIndex = positionInRound;
    } else {
      // Backward direction (3, 2, 1, 0...)
      teamIndex = numTeams - 1 - positionInRound;
    }
    
    // Check if this team can still accept players (size constraint)
    if (teamSizes[teamIndex] >= maxTeamSize) {
      // Find the best available team
      teamIndex = findBestTeamForPlayer(teamSizes, maxTeamSize, i, numTeams, player.lastActiveTs, startForward);
    }
    
    // Assign player to team (teams are numbered 1, 2, 3...)
    const teamId = teamIndex + 1;
    mapping.set(player.id, teamId);
    teamScores[teamIndex] += player.engagementScore;
    teamSizes[teamIndex]++;
  }
  
  return mapping;
}

/**
 * Finds the best team for a player based on size constraints and last active timestamp
 * This ensures deterministic tie-breaking while respecting size limits
 * Players with older lastActiveTs are prioritized for larger teams
 */
function findBestTeamForPlayer(teamSizes: number[], maxTeamSize: number, playerIndex: number, numTeams: number, lastActiveTs: string, startForward: boolean): number {
  // First, find teams that can still accept players
  const availableTeams: number[] = [];
  for (let i = 0; i < numTeams; i++) {
    if (teamSizes[i] < maxTeamSize) {
      availableTeams.push(i);
    }
  }
  
  // If all teams are at max size, find the one with smallest current size
  if (availableTeams.length === 0) {
    let minSize = teamSizes[0];
    let minTeam = 0;
    for (let i = 1; i < numTeams; i++) {
      if (teamSizes[i] < minSize) {
        minSize = teamSizes[i];
        minTeam = i;
      }
    }
    return minTeam;
  }
  
  // If only one team available, use it
  if (availableTeams.length === 1) {
    return availableTeams[0];
  }
  
  // Parse the last active timestamp to determine if player is less active
  // Convert "2025-08-13 0:00:00" format to ISO format for proper parsing
  const formattedTs = lastActiveTs.replace(' ', 'T').replace(/(\d+):(\d+):(\d+)/, (match, h, m, s) => 
    `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
  );
  const lastActiveDate = new Date(formattedTs);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const isLessActive = lastActiveDate < thirtyDaysAgo;
  
  if (isLessActive) {
    // For less active players: prefer larger teams (more engagement opportunity)
    // Sort available teams by size (largest first), then by team index for deterministic tie-breaking
    availableTeams.sort((a, b) => {
      if (teamSizes[b] !== teamSizes[a]) {
        return teamSizes[b] - teamSizes[a]; // Larger teams first
      }
      return a - b; // Team index for deterministic tie-breaking
    });
    return availableTeams[0];
  } else {
    // For active players: use snake draft pattern for balanced distribution
    const round = Math.floor(playerIndex / numTeams);
    const positionInRound = playerIndex % numTeams;
    
    let teamIndex: number;
    const isEvenRound = round % 2 === 0;
    const shouldGoForward = startForward ? isEvenRound : !isEvenRound;
    
    if (shouldGoForward) {
      // Forward direction (0, 1, 2, 3...)
      teamIndex = positionInRound;
    } else {
      // Backward direction (3, 2, 1, 0...)
      teamIndex = numTeams - 1 - positionInRound;
    }
    
    // If the calculated team is available, use it
    if (availableTeams.includes(teamIndex)) {
      return teamIndex;
    }
    
    // Otherwise, find the first available team in the snake order
    for (let i = 0; i < numTeams; i++) {
      const snakeIndex = shouldGoForward ? i : numTeams - 1 - i;
      if (availableTeams.includes(snakeIndex)) {
        return snakeIndex;
      }
    }
    
    // Fallback: return the first available team
    return availableTeams[0];
  }
}

/**
 * Sets a seed for Math.random() so we get the same "random" results every time
 * This is useful for testing and making results reproducible
 */
function setRandomSeed(seed: number): void {
  // Replace Math.random with our own seeded random number generator
  Math.random = (() => {
    let currentSeed = seed;
    return () => {
      // Linear Congruential Generator (LCG) - a simple way to generate pseudo-random numbers
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296; // Convert to 0-1 range
    };
  })();
}