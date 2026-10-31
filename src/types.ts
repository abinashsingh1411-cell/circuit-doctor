export type CircuitVerdict = 'CORRECT' | 'INCORRECT' | 'WARNING / POTENTIAL ISSUE';

export interface IdentifiedError {
  component: string;
  pinOrNode: string;
  visualLocation: string;
  evidence: string;
  isInconclusive: boolean;
}

export interface IdentifiedComponent {
  name: string;
  package: string;
  designator: string;
  status: 'verified' | 'inconclusive' | 'faulty';
  notes: string;
}

export interface ContinuityNode {
  nodeName: string;
  pinsConnected: string;
  status: 'VALID' | 'OPEN_FAULT' | 'SHORT_FAULT' | 'INCONCLUSIVE';
  detail: string;
}

export interface ElectricalRuleCheck {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'INCONCLUSIVE';
  detail: string;
}

export interface CircuitAnalysisResult {
  verdict: CircuitVerdict;
  summary: string;
  identifiedErrors: IdentifiedError[];
  rootCauseAndImpact: string;
  stepByStepRemediation: string[];
  safetyAndDamageRisk: string;
  identifiedComponents: IdentifiedComponent[];
  continuityMatrix: ContinuityNode[];
  electricalRuleChecks: ElectricalRuleCheck[];
  rawMarkdownOutput: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
