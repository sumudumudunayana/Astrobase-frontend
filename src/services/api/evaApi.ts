import { apiClient } from './apiClient';
import type {
  EvaScenario,
  EvaChecklistItem,
  EvaActionRequest,
  EvaActionResponse,
  EvaCompleteRequest,
  EvaCompleteResponse,
} from '../../types/training';

export const evaApi = {
  /**
   * Get all available EVA simulation scenarios
   */
  async getScenarios(): Promise<EvaScenario[]> {
    const response = await apiClient.get<EvaScenario[]>('/eva/scenarios');
    return response.data;
  },

  /**
   * Get detail for a specific EVA scenario
   */
  async getScenarioById(scenarioId: string): Promise<EvaScenario> {
    const response = await apiClient.get<EvaScenario>(`/eva/scenarios/${scenarioId}`);
    return response.data;
  },

  /**
   * Get pre-EVA checklist items for a scenario
   */
  async getScenarioChecklist(scenarioId: string): Promise<EvaChecklistItem[]> {
    const response = await apiClient.get<EvaChecklistItem[]>(`/eva/scenarios/${scenarioId}/checklist`);
    return response.data;
  },

  /**
   * Start an EVA simulation session
   */
  async startScenario(scenarioId: string): Promise<{ sessionId: string; startedAt: string; scenario: EvaScenario }> {
    const response = await apiClient.post<{ sessionId: string; startedAt: string; scenario: EvaScenario }>(
      `/eva/scenarios/${scenarioId}/start`
    );
    return response.data;
  },

  /**
   * Execute an EVA action (movement, tool use, tether anchor, repair)
   */
  async executeAction(scenarioId: string, action: EvaActionRequest): Promise<EvaActionResponse> {
    const response = await apiClient.post<EvaActionResponse>(`/eva/scenarios/${scenarioId}/actions`, action);
    return response.data;
  },

  /**
   * Complete scenario and submit operator log for certification debrief
   */
  async completeScenario(scenarioId: string, request: EvaCompleteRequest): Promise<EvaCompleteResponse> {
    const response = await apiClient.post<EvaCompleteResponse>(`/eva/scenarios/${scenarioId}/complete`, request);
    return response.data;
  },
};

