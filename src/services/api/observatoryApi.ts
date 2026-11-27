import { apiClient } from './apiClient';
import type {
  SpaceWeatherEvent,
  RadLabDosimetry,
  MarsRoverPhoto,
  MarsTrekSite,
  CsaPracticalTrainingState,
  SubmitPracticalTrainingRequest,
  SubmitPracticalTrainingResponse,
} from '../../types/observatory';

export const observatoryApi = {
  /**
   * NASA DONKI space weather alert feeds (CME, Solar Flares, SEP, Geomagnetic Storms)
   */
  async getSpaceWeatherAlerts(): Promise<SpaceWeatherEvent[]> {
    const response = await apiClient.get<SpaceWeatherEvent[]>('/observatory/space-weather');
    return response.data;
  },

  /**
   * NASA RadLab radiation dosimetry telemetry from ISS detectors (DOSTEL, Liulin-5, TEPC)
   */
  async getRadiationDosimetry(): Promise<RadLabDosimetry[]> {
    const response = await apiClient.get<RadLabDosimetry[]>('/observatory/radiation-dosimetry');
    return response.data;
  },

  /**
   * NASA Mars Rover raw science photos (Curiosity & Perseverance)
   */
  async getMarsRoverPhotos(rover: string = 'Perseverance'): Promise<MarsRoverPhoto[]> {
    const response = await apiClient.get<MarsRoverPhoto[]>(`/observatory/mars-photos?rover=${encodeURIComponent(rover)}`);
    return response.data;
  },

  /**
   * NASA Mars Trek GIS sites and MOLA/Viking basemap metadata
   */
  async getMarsTrekSites(): Promise<MarsTrekSite[]> {
    const response = await apiClient.get<MarsTrekSite[]>('/observatory/mars-trek-sites');
    return response.data;
  },

  /**
   * CSA Practical Training state
   */
  async getTrainingState(): Promise<CsaPracticalTrainingState> {
    const response = await apiClient.get<CsaPracticalTrainingState>('/observatory/practical-training/state');
    return response.data;
  },

  /**
   * Evaluate astronaut practical drill (Centrifuge AGSM, Canadarm Robotics, CSA Food Production)
   */
  async evaluateDrill(request: SubmitPracticalTrainingRequest): Promise<SubmitPracticalTrainingResponse> {
    const response = await apiClient.post<SubmitPracticalTrainingResponse>('/observatory/practical-training/evaluate', request);
    return response.data;
  },
};
