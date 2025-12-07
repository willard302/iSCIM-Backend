export interface User {
  id: number;
  name: string;
  email: string;
  ipoints: number;
  level: string;
  phone?: string;
  gender?: string;
  country?: string;
  countryIdx?: number;
  city?: string;
  cityIdx?: number;
  geo?: string;
  cosmos?: object;
  musictherapy: boolean;
  recommender?: string;
}
