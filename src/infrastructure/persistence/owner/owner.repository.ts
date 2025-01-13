import {
  OwnerDomain,
  OwnerImgDomain,
} from '@resources/owner/domain/owner.domain';
import { NullAble } from '@utils/types/common.type';

export abstract class OwnerRepository {
  /**
   * @abstract
   * @returns OwnerDomain
   *
   * Retrieve all owner information
   */
  abstract findOwnerInformation(): Promise<OwnerDomain>;

  /**
   * @abstract
   * @returns OwnerDomain
   *
   * Retrieve only owner email information
   */
  abstract findEmailInformation(): Promise<
    Pick<OwnerDomain, 'email' | 'passwordForEmail'>
  >;

  abstract findImageById(
    imageId: OwnerImgDomain['id'],
  ): Promise<NullAble<OwnerImgDomain>>;

  /**
   * @abstract
   * @returns OwnerDomain
   *
   * Update some field of owner information
   */
  abstract updateOwnerInformation(
    data: Partial<OwnerDomain>,
  ): Promise<OwnerDomain>;

  /**
   * @abstract
   * @param id
   * @param newImgPath
   * @returns OwnerImgDomain
   *
   * Update owner image by ID
   */
  abstract updateOwnerImgById(
    id: OwnerImgDomain['id'],
    newImgPath: OwnerImgDomain['imgPath'],
  ): Promise<OwnerImgDomain>;

  /**
   * @abstract
   * @param id
   * @returns OwnerImgDomain
   *
   * Delete owner image by ID
   */
  abstract deleteOwnerImgById(id: OwnerImgDomain['id']): Promise<void>;
}
