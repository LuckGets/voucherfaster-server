export class PackageVoucherDomain {
  id: string;
  quotaVoucherId: string;
  name: string;
  startedAt: Date;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
