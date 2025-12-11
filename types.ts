export enum AgentType {
  CENTRAL_MANAGER = 'Central Manager',
  ADMISSION = 'Patient Admission Agent',
  SCHEDULING = 'Appointment Scheduling Agent',
  PHARMACY = 'Pharmacy Management Agent',
  BILLING = 'Billing & Finance Agent'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  agent?: AgentType; // The agent who sent this message
  timestamp: Date;
  isDelegation?: boolean; // If true, this is a system log showing delegation
}

export interface AgentState {
  currentAgent: AgentType;
  isThinking: boolean;
  history: Message[];
}

export interface DelegationResult {
  targetAgent: AgentType;
  context: string;
  reason: string;
}
