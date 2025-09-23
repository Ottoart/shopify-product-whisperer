export interface Marketplace {
  id: string;
  name: string;
  platform: string;
  logo: string;
  description: string;
  isPopular?: boolean;
  benefits?: string[];
}