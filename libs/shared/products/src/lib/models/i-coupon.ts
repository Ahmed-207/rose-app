
export interface ICoupon {
  id: string;              
  code: string;            
  type: 'PERCENT' | 'FIXED'; 
  value: string;           
  minPurchase: string;     
  maxDiscount?: string;    
  usageLimit: number;      
  usedCount: number;       
  validFrom: string;       
  validUntil: string;      
  isActive: boolean;      

}

export interface ICouponResponse {
  message: string;
  data: ICoupon;
}

export interface ICouponsPaginatedResponse {
  results: number;
  metadata: {
    currentPage: number;
    numberOfPages: number;
    limit: number;
  };
  data: ICoupon[];
}