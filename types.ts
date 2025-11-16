
export interface InputData {
  totalHours: string;
  productiveHours: string;
  plannedTasks: string;
  completedTasks: string;
  valuePerHour: string;
  estimatedCostPerDistraction: string;
  distractions: string;
  recoveryTime: string;
}

export interface CalculationResults {
  productivityRate: number;
  taskCompletionRate: number;
  efficiencyScore: number;
  timeLost: number;
  valueLost: number;
  taskEfficiency: number;
}

export interface ImprovementScenario {
  area: string;
  current: string;
  optimized: string;
  gain: string;
  addedValue: string;
}
