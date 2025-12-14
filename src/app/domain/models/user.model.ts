export interface User {
  id: number;
  username: string;
  password: string;
  email?: string;
  token?: string;
  profile: Profile;
}
export interface Profile {
  name: {
    firstname: string;
    lastname: string;
  };
  address?: {
    geolocation: {
      lat: string;
      long: string;
    };
    city?: string;
    street?: string;
    number?: number;
    zipcode?: string;
  };
}
