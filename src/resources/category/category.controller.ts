import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { CATEGORIES_CONST, CategoryPath } from 'src/config/api-path';
import { CategoryService } from './category.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RoleEnum } from '@resources/account/types/account.type';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { VoucherTagService } from './tag/voucher-tag.service';
import {
  CreateVoucherTagDto,
  CreateVoucherTagResponse,
} from './dto/tag/create-tag.dto';
import {
  CreateCategoryDto,
  CreateCategoryResponse,
} from './dto/category/create-category.dto';
import { GetManyCategoryResponse } from './dto/category/get-category.dto';
import { QUERY_FIELD_NAME } from 'src/common/types/pagination.type';
import { UpdateVoucherTagDto } from './dto/tag/update-tag.dto';
import { CategoryDomain } from './domain/category.domain';
import { VoucherTagDomain } from './domain/tag.domain';
import { GetManyVoucherTagResponse } from './dto/tag/get-tag.dto';
import {
  UpdateCategoryDto,
  UpdateCategoryResponse,
} from './dto/category/update-category.dto';
import { DeleteCategoryResponse } from './dto/category/delete-category.dto';

@Controller({ version: '1', path: CategoryPath.Base })
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private voucherTagService: VoucherTagService,
  ) {}

  // -------------------------------------------------------------------- //
  // ------------------------- CATEGORY PART ---------------------------- //
  // -------------------------------------------------------------------- //

  @ApiBody({ type: () => CreateCategoryDto })
  @ApiCreatedResponse({ type: () => CreateCategoryResponse })
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Post()
  async createCategory(
    @Body() body: CreateCategoryDto,
  ): Promise<CreateCategoryResponse> {
    const createdCategory = await this.categoryService.create(body);
    return CreateCategoryResponse.success(createdCategory);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: () => GetManyCategoryResponse,
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.CURSOR,
    description: 'Cursor for pagination.',
    required: false,
  })
  @Get()
  async getPaginationCategory(
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: string,
  ): Promise<GetManyCategoryResponse> {
    const categoriesList =
      await this.categoryService.getPaginationVoucherCategory({
        cursor,
      });
    return GetManyCategoryResponse.success(categoriesList);
  }

  @ApiBearerAuth()
  @ApiBody({ type: () => UpdateCategoryDto })
  @ApiOkResponse({ type: () => UpdateCategoryResponse })
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Patch(CategoryPath.UpdateCategory)
  async updateCategory(
    @Body() body: UpdateCategoryDto,
  ): Promise<UpdateCategoryResponse> {
    const updatedCategory = await this.categoryService.update(body);
    return UpdateCategoryResponse.success(updatedCategory);
  }

  @ApiBearerAuth()
  @ApiParam({ name: CATEGORIES_CONST.PARAM_ID })
  @UseGuards(AdminGuard)
  @Delete(CategoryPath.DeleteCategory)
  async deleteCategory(
    @Param(CATEGORIES_CONST.PARAM_ID) id: CategoryDomain['id'],
  ): Promise<DeleteCategoryResponse> {
    await this.categoryService.delete(id);
    return DeleteCategoryResponse.success(id);
  }

  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER TAG PART -------------------------
  // -------------------------------------------------------------------- //

  @ApiBearerAuth()
  @ApiBody({ type: () => CreateVoucherTagDto })
  @ApiCreatedResponse({ type: () => CreateVoucherTagResponse })
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Post(CategoryPath.CreateTag)
  async createVoucherTag(
    @Body() body: CreateVoucherTagDto,
  ): Promise<CreateVoucherTagResponse> {
    const newVoucherTag = await this.voucherTagService.createVoucherTag(body);
    return CreateVoucherTagResponse.success(newVoucherTag);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: [RoleEnum.Admin],
  })
  @UseGuards(AdminGuard)
  @Patch(CategoryPath.UpdateTag)
  async updateVoucherTag(@Body() body: UpdateVoucherTagDto) {
    return this.voucherTagService.updateVoucherTag(body);
  }

  @ApiQuery({
    name: 'category',
    description: 'Tag name of the voucher to filter by.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
  @ApiQuery({
    name: 'cursor',
    description: 'Cursor for pagination.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
  @SerializeOptions({
    groups: [RoleEnum.Admin, RoleEnum.User],
  })
  @Get(CategoryPath.GetManyTagByCategory)
  async getPaginationVoucherTag(
    @Query(CategoryPath.CategoryQuery)
    category: CategoryDomain['name'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: VoucherTagDomain['id'],
  ): Promise<GetManyVoucherTagResponse> {
    const voucherTagList = await this.voucherTagService.getPaginationVoucherTag(
      {
        category,
        cursor,
      },
    );

    return GetManyVoucherTagResponse.success(voucherTagList);
  }
}
