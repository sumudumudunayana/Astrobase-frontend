import { apiClient } from './apiClient';
import type {
  MissionPlan,
  ValidatePlanRequest,
  ValidatePlanResponse,
  MissionControlTelemetry,
  MissionControlActionRequest,
  MissionControlActionResponse,
  MissionControlCompleteRequest,
  MissionControlCompleteResponse,
} from '../../types/training';

export const missionPlanningApi = {
  /**
   * Get default template mission plan for Moon or Mars
   */
  async getDefaultPlan(targetBody: 'Moon' | 'Mars' | string = 'Moon'): Promise<MissionPlan> {
    const response = await apiClient.get<MissionPlan>(`/mission-planning/default-plan?targetBody=${encodeURIComponent(targetBody)}`);
    return response.data;
  },

  /**
   * Get all mission plans for current trainee
   */
  async getPlans(): Promise<MissionPlan[]> {
    const response = await apiClient.get<MissionPlan[]>('/mission-planning/plans');
    return response.data;
  },

  /**
   * Get mission plan by ID
   */
  async getPlanById(planId: string): Promise<MissionPlan> {
    const response = await apiClient.get<MissionPlan>(`/mission-planning/plans/${planId}`);
    return response.data;
  },

  /**
   * Save or update a mission plan
   */
  async savePlan(plan: MissionPlan): Promise<MissionPlan> {
    const response = await apiClient.post<MissionPlan>('/mission-planning/plans', plan);
    return response.data;
  },

  /**
   * Authoritative validation of mission plan (objectives, timeline, crew, resources, risks)
   */
  async validatePlan(request: ValidatePlanRequest): Promise<ValidatePlanResponse> {
    const response = await apiClient.post<ValidatePlanResponse>('/mission-planning/validate-plan', request);
    return response.data;
  },

  /**
   * Get Mission Control Center simulation telemetry
   */
  async getSimulationTelemetry(scenarioId: string = 'LUNAR_EXPEDITION_01'): Promise<MissionControlTelemetry> {
    const response = await apiClient.get<MissionControlTelemetry>(`/mission-planning/simulation/${scenarioId}`);
    return response.data;
  },

  /**
   * Execute Mission Control action (GO_POLL, RESOLVE_ANOMALY, REALLOCATE_RESOURCE, DISPATCH_COMM, ADVANCE_PHASE)
   */
  async executeSimulationAction(scenarioId: string, action: MissionControlActionRequest): Promise<MissionControlActionResponse> {
    const response = await apiClient.post<MissionControlActionResponse>(`/mission-planning/simulation/${scenarioId}/action`, action);
    return response.data;
  },

  /**
   * Complete Mission Control Center simulation and receive Flight Director certification
   */
  async completeSimulation(request: MissionControlCompleteRequest): Promise<MissionControlCompleteResponse> {
    const response = await apiClient.post<MissionControlCompleteResponse>('/mission-planning/simulation/complete', request);
    return response.data;
  },
};
