// src/components/types.ts
export interface GAAsset {
  id: string;
  item_name: string;
  category: string;
  brand: string;
  serial_number: string;
  status: string;
  location: string;
  user_assigned: string;
  remarks: string;
  qr_value: string;
  user_id?: string;
  image_url?: string;
  created_at?: string;
  no_plate?: string;
  vehicle_type?: string;
  condition?: string;
  department?: string;
  purchase_date?: string;
  stnk_expiry?: string;
}

export const emptyAssetForm: GAAsset = {
  id: '',
  item_name: '',
  category: '',
  brand: '',
  serial_number: '',
  status: '',
  location: '',
  user_assigned: '',
  remarks: '',
  qr_value: '',
  user_id: '',
  image_url: '',
  created_at: '',
  no_plate: '',
  vehicle_type: '',
  condition: '',
  department: '',
  purchase_date: '',
  stnk_expiry: '',
};
