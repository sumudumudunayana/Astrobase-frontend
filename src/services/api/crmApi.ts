import { apiClient } from './apiClient';
import type {
  CrmTrainingCenterState,
  ExecuteCrmActionRequest,
  ExecuteCrmActionResponse,
  CrmMissionDebrief,
} from '../../types/training';

export const crmApi = {
  /**
   * Get complete state for the CRM Training Center (Lunar Expedition or Mars Transit)
   */
  async getState(scenarioCode: string = 'LUNAR_EXPEDITION_CRM'): Promise<CrmTrainingCenterState> {
    const response = await apiClient.get<CrmTrainingCenterState>(`/crm/state?scenarioCode=${encodeURIComponent(scenarioCode)}`);
    return response.data;
  },

  /**
   * Execute an authoritative CRM action (task assignment, leadership decision, conflict resolution, rest schedule adjustment, cross-check verification)
   */
  async executeAction(request: ExecuteCrmActionRequest): Promise<ExecuteCrmActionResponse> {
    const response = await apiClient.post<ExecuteCrmActionResponse>('/crm/action', request);
    return response.data;
  },

  /**
   * Retrieve the authoritative mission debriefing and score breakdown
   */
  async getDebrief(scenarioCode: string = 'LUNAR_EXPEDITION_CRM'): Promise<CrmMissionDebrief> {
    const response = await apiClient.get<CrmMissionDebrief>(`/crm/debrief?scenarioCode=${encodeURIComponent(scenarioCode)}`);
    return response.data;
  },
};
