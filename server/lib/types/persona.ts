export interface PersonaIdentity {
  id: string;
  createdAt: number;
  name: string;
  status: PersonaInquiryStatus;
}

export enum PersonaInquiryStatus {
  NONE = 'NONE',
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  UNKNOWN = 'UNKNOWN',
}
