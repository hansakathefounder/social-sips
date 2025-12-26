// Major cities in Sri Lanka for restaurant filtering
export const SRI_LANKA_CITIES = [
  { name: 'All Cities', value: '', lat: 7.8731, lng: 80.7718 },
  { name: 'Colombo', value: 'colombo', lat: 6.9271, lng: 79.8612 },
  { name: 'Kandy', value: 'kandy', lat: 7.2906, lng: 80.6337 },
  { name: 'Galle', value: 'galle', lat: 6.0535, lng: 80.2210 },
  { name: 'Negombo', value: 'negombo', lat: 7.2008, lng: 79.8358 },
  { name: 'Jaffna', value: 'jaffna', lat: 9.6615, lng: 80.0255 },
  { name: 'Batticaloa', value: 'batticaloa', lat: 7.7102, lng: 81.6924 },
  { name: 'Trincomalee', value: 'trincomalee', lat: 8.5874, lng: 81.2152 },
  { name: 'Anuradhapura', value: 'anuradhapura', lat: 8.3114, lng: 80.4037 },
  { name: 'Matara', value: 'matara', lat: 5.9549, lng: 80.5550 },
  { name: 'Kurunegala', value: 'kurunegala', lat: 7.4867, lng: 80.3647 },
  { name: 'Nuwara Eliya', value: 'nuwara eliya', lat: 6.9497, lng: 80.7891 },
  { name: 'Ratnapura', value: 'ratnapura', lat: 6.6828, lng: 80.3992 },
  { name: 'Badulla', value: 'badulla', lat: 6.9934, lng: 81.0550 },
  { name: 'Hikkaduwa', value: 'hikkaduwa', lat: 6.1395, lng: 80.1063 },
  { name: 'Bentota', value: 'bentota', lat: 6.4212, lng: 79.9984 },
  { name: 'Unawatuna', value: 'unawatuna', lat: 6.0092, lng: 80.2495 },
  { name: 'Mirissa', value: 'mirissa', lat: 5.9483, lng: 80.4716 },
  { name: 'Ella', value: 'ella', lat: 6.8667, lng: 81.0466 },
  { name: 'Sigiriya', value: 'sigiriya', lat: 7.9570, lng: 80.7603 },
  { name: 'Dambulla', value: 'dambulla', lat: 7.8742, lng: 80.6511 },
] as const;

export type CityValue = typeof SRI_LANKA_CITIES[number]['value'];
