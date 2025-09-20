export interface Player {
  id: number;
  engagementScore: number;
  currentTeam: number;
  currentTeamName: string;
  historicalEventsParticipated: number;
  historicalEventEngagements: number;
  historicalPointsEarned: number;
  historicalPointsSpent: number;
  historicalMessagesSent: number;
  currentTotalPoints: number;
  daysActiveLast30: number;
  currentStreakValue: number;
  lastActiveTs: string;
}

export interface TeamInfo {
  id: number;
  size: number;
  totalEngagement: number;
  avgEngagement: number;
  players: Player[];
}

export interface TeamSortResult {
  mapping: Map<number, number>; // player_id -> team_id
  teams: TeamInfo[]; // Team information for summary
}
