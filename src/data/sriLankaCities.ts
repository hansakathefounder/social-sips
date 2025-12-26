// Major cities in Sri Lanka for restaurant filtering
export const SRI_LANKA_CITIES = [
  { name: 'All Cities', value: '' },
  { name: 'Colombo', value: 'colombo' },
  { name: 'Kandy', value: 'kandy' },
  { name: 'Galle', value: 'galle' },
  { name: 'Negombo', value: 'negombo' },
  { name: 'Jaffna', value: 'jaffna' },
  { name: 'Batticaloa', value: 'batticaloa' },
  { name: 'Trincomalee', value: 'trincomalee' },
  { name: 'Anuradhapura', value: 'anuradhapura' },
  { name: 'Matara', value: 'matara' },
  { name: 'Kurunegala', value: 'kurunegala' },
  { name: 'Nuwara Eliya', value: 'nuwara eliya' },
  { name: 'Ratnapura', value: 'ratnapura' },
  { name: 'Badulla', value: 'badulla' },
  { name: 'Hikkaduwa', value: 'hikkaduwa' },
  { name: 'Bentota', value: 'bentota' },
  { name: 'Unawatuna', value: 'unawatuna' },
  { name: 'Mirissa', value: 'mirissa' },
  { name: 'Ella', value: 'ella' },
  { name: 'Sigiriya', value: 'sigiriya' },
  { name: 'Dambulla', value: 'dambulla' },
] as const;

export type CityValue = typeof SRI_LANKA_CITIES[number]['value'];
