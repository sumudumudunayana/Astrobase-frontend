import { apiClient } from './apiClient';
import type {
  PlanetaryEnvironment,
  PlanetaryMission,
  RoverActionRequest,
  RoverActionResponse,
  SampleActionRequest,
  SampleActionResponse,
  LandingSiteEvaluateRequest,
  LandingSiteEvaluateResponse,
  PlanetaryMissionCompleteRequest,
  PlanetaryMissionCompleteResponse,
} from '../../types/training';

export const planetaryApi = {
  /**
   * Get physical and atmospheric parameters for Earth, Moon, and Mars
   */
  async getEnvironments(): Promise<PlanetaryEnvironment[]> {
    const response = await apiClient.get<PlanetaryEnvironment[]>('/planetary/environments');
    return response.data;
  },

  /**
   * Get all planetary surface exploration missions
   */
  async getMissions(): Promise<PlanetaryMission[]> {
    const response = await apiClient.get<PlanetaryMission[]>('/planetary/missions');
    return response.data;
  },

  /**
   * Get mission details by ID
   */
  async getMissionById(missionId: string): Promise<PlanetaryMission> {
    const response = await apiClient.get<PlanetaryMission>(`/planetary/missions/${missionId}`);
    return response.data;
  },

  /**
   * Start or reset a planetary surface mission session
   */
  async startMission(missionId: string): Promise<PlanetaryMission> {
    const response = await apiClient.post<PlanetaryMission>(`/planetary/missions/${missionId}/start`);
    return response.data;
  },

  /**
   * Send rover telemetry command (drive, steer, pan camera, deploy arm)
   */
  async executeRoverAction(missionId: string, action: RoverActionRequest): Promise<RoverActionResponse> {
    const response = await apiClient.post<RoverActionResponse>(`/planetary/missions/${missionId}/rover-action`, action);
    return response.data;
  },

  /**
   * Execute scientific sample drilling, scooping, and hermetic sealing
   */
  async executeSampleAction(missionId: string, action: SampleActionRequest): Promise<SampleActionResponse> {
    const response = await apiClient.post<SampleActionResponse>(`/planetary/missions/${missionId}/sample-action`, action);
    return response.data;
  },

  /**
   * Submit student landing site evaluation and trade study assessment
   */
  async evaluateLandingSite(missionId: string, request: LandingSiteEvaluateRequest): Promise<LandingSiteEvaluateResponse> {
    const response = await apiClient.post<LandingSiteEvaluateResponse>(`/planetary/missions/${missionId}/landing-site-evaluate`, request);
    return response.data;
  },

  /**
   * Complete mission, submit final science report, and receive Flight Director certification
   */
  async completeMission(missionId: string, request: PlanetaryMissionCompleteRequest): Promise<PlanetaryMissionCompleteResponse> {
    const response = await apiClient.post<PlanetaryMissionCompleteResponse>(`/planetary/missions/${missionId}/complete`, request);
    return response.data;
  },
};
