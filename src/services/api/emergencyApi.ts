import { apiClient } from './apiClient';
import type {
  EmergencyScenario,
  EmergencyActionRequest,
  EmergencyActionResponse,
  EmergencyCommRequest,
  EmergencyCommMessage,
  EmergencyCompleteRequest,
  EmergencyCompleteResponse,
} from '../../types/training';

export const emergencyApi = {
  /**
   * Get all emergency response training scenarios
   */
  async getScenarios(): Promise<EmergencyScenario[]> {
    const response = await apiClient.get<EmergencyScenario[]>('/emergency/scenarios');
    return response.data;
  },

  /**
   * Get scenario details by ID
   */
  async getScenarioById(scenarioId: string): Promise<EmergencyScenario> {
    const response = await apiClient.get<EmergencyScenario>(`/emergency/scenarios/${scenarioId}`);
    return response.data;
  },

  /**
   * Start or reset an emergency scenario session
   */
  async startScenario(scenarioId: string): Promise<EmergencyScenario> {
    const response = await apiClient.post<EmergencyScenario>(`/emergency/scenarios/${scenarioId}/start`);
    return response.data;
  },

  /**
   * Execute an emergency procedure action (mask donning, hatch isolation, ventilation shutdown, etc.)
   */
  async executeAction(scenarioId: string, action: EmergencyActionRequest): Promise<EmergencyActionResponse> {
    const response = await apiClient.post<EmergencyActionResponse>(`/emergency/scenarios/${scenarioId}/actions`, action);
    return response.data;
  },

  /**
   * Transmit voice/data message to CapCom or Flight Surgeon
   */
  async sendCommunication(scenarioId: string, message: EmergencyCommRequest): Promise<EmergencyCommMessage> {
    const response = await apiClient.post<EmergencyCommMessage>(`/emergency/scenarios/${scenarioId}/communication`, message);
    return response.data;
  },

  /**
   * Complete emergency drill and receive Flight Director evaluation and certification score
   */
  async completeScenario(scenarioId: string, request: EmergencyCompleteRequest): Promise<EmergencyCompleteResponse> {
    const response = await apiClient.post<EmergencyCompleteResponse>(`/emergency/scenarios/${scenarioId}/complete`, request);
    return response.data;
  },
};
