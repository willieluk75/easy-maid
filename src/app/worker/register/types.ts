export interface OverseasExp {
  country: string;
  duration: string;
}

export const emptyDuty = {
  working_country: '',
  duration_from: '',
  duration_to: '',
  salary: '',
  reason_to_leave: '',
  employer_family_info: '',
  skill_care_babies: false,
  baby_age_range: '',
  skill_care_toddler: false,
  toddler_age_range: '',
  skill_care_children: false,
  children_age_range: '',
  skill_care_elderly: false,
  skill_care_disabled: false,
  skill_care_bedridden: false,
  skill_care_pet: false,
  skill_household: false,
  skill_car_washing: false,
  skill_gardening: false,
  skill_cooking: false,
  skill_driving: false,
  skill_pickup_taobao: false,
};

export type PreviousDuty = typeof emptyDuty;

export interface WorkerFormData {
  // Step 1: 基本資料
  photo_url: string;
  name: string;
  nationality: string;
  gender: string;
  date_of_birth: string;
  marital_status: string;
  education: string;
  religion: string;
  height_cm: string;
  weight_kg: string;
  birth_order: string;
  num_brothers: string;
  num_sisters: string;
  num_sons: string;
  son_ages: string;
  num_daughters: string;
  daughter_ages: string;
  // Step 2: 聯絡及合約
  hkid: string;
  hk_mobile: string;
  contract_end_date: string;
  // Step 3: 技能
  skill_care_babies: boolean;
  skill_care_toddler: boolean;
  skill_care_children: boolean;
  skill_care_elderly: boolean;
  skill_care_disabled: boolean;
  skill_care_bedridden: boolean;
  skill_care_pet: boolean;
  skill_household: boolean;
  skill_car_washing: boolean;
  skill_gardening: boolean;
  skill_cooking: boolean;
  skill_driving: boolean;
  skill_pickup_taobao: boolean;
  // Step 4: 語言能力
  lang_mandarin: string;
  lang_cantonese: string;
  lang_english: string;
  // Step 5: 海外工作記錄
  overseas: OverseasExp[];
  // Step 6: 過去工作詳情
  duties: PreviousDuty[];
  // Step 7: 其他問題
  eats_pork: string;
  available_sundays: string;
  can_share_room: string;
  share_room_notes: string;
  has_tattoo: string;
  smokes: string;
  afraid_of_pets: string;
  had_surgery: string;
  surgery_details: string;
  has_allergies: string;
  allergy_details: string;
  // Step 8: 備注
  remark: string;
}

export const initialFormData: WorkerFormData = {
  photo_url: '',
  name: '',
  nationality: 'Filipino',
  gender: 'F',
  date_of_birth: '',
  marital_status: '',
  education: '',
  religion: '',
  height_cm: '',
  weight_kg: '',
  birth_order: '',
  num_brothers: '',
  num_sisters: '',
  num_sons: '',
  son_ages: '',
  num_daughters: '',
  daughter_ages: '',
  hkid: '',
  hk_mobile: '',
  contract_end_date: '',
  skill_care_babies: false,
  skill_care_toddler: false,
  skill_care_children: false,
  skill_care_elderly: false,
  skill_care_disabled: false,
  skill_care_bedridden: false,
  skill_care_pet: false,
  skill_household: false,
  skill_car_washing: false,
  skill_gardening: false,
  skill_cooking: false,
  skill_driving: false,
  skill_pickup_taobao: false,
  lang_mandarin: '',
  lang_cantonese: '',
  lang_english: '',
  overseas: [],
  duties: [],
  eats_pork: '',
  available_sundays: '',
  can_share_room: '',
  share_room_notes: '',
  has_tattoo: '',
  smokes: '',
  afraid_of_pets: '',
  had_surgery: '',
  surgery_details: '',
  has_allergies: '',
  allergy_details: '',
  remark: '',
};
