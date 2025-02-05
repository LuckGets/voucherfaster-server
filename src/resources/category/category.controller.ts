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
import {
  GetCategoryByIdResponse,
  GetManyCategoryResponse,
} from './dto/category/get-category.dto';
import {
  IPaginationOption,
  QUERY_FIELD_DOC,
  QUERY_FIELD_NAME,
} from 'src/common/types/pagination.type';
import {
  UpdateVoucherTagDto,
  UpdateVoucherTagResponse,
} from './dto/tag/update-tag.dto';
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
  @ApiQuery({
    name: QUERY_FIELD_NAME.DIRECTION,
    description:
      'Direction for pagination. Can provide two kind of value: NEXT, PREVIOUS',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.PAGE,
    description: QUERY_FIELD_DOC.PAGE,
    required: false,
    type: Number, // Adjust to the correct type if needed
  })
  @Get()
  async getPaginationCategory(
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: string,
    @Query(QUERY_FIELD_NAME.PAGE) page: IPaginationOption['page'],
  ): Promise<GetManyCategoryResponse> {
    const categoriesList =
      await this.categoryService.getPaginationVoucherCategory({
        cursor,
        paginationOption: { page },
      });
    return GetManyCategoryResponse.success(categoriesList, page ?? 1);
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
  async updateVoucherTag(
    @Body() body: UpdateVoucherTagDto,
  ): Promise<UpdateVoucherTagResponse> {
    const updatedTag = await this.voucherTagService.updateVoucherTag(body);
    return UpdateVoucherTagResponse.success(updatedTag);
  }

  @ApiQuery({
    name: CategoryPath.CategoryQuery,
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.CURSOR,
    description: 'Cursor for pagination to the next page of data.',
    required: false,
    type: String, // Adjust to the correct type if needed
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.DIRECTION,
    description:
      'Direction for pagination. Can provide two kind of value: NEXT, PREVIOUS',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: QUERY_FIELD_NAME.PAGE,
    description: QUERY_FIELD_DOC.PAGE,
    required: false,
    type: Number, // Adjust to the correct type if needed
  })
  @SerializeOptions({
    groups: [RoleEnum.Admin, RoleEnum.User],
  })
  @Get(CategoryPath.GetManyTag)
  async getPaginationVoucherTag(
    @Query(CategoryPath.CategoryQuery)
    category: CategoryDomain['name'],
    @Query(QUERY_FIELD_NAME.CURSOR) cursor: VoucherTagDomain['id'],
    @Query(QUERY_FIELD_NAME.PAGE) page: IPaginationOption['page'],
  ): Promise<GetManyVoucherTagResponse> {
    const voucherTagList = await this.voucherTagService.getPaginationVoucherTag(
      {
        paginationOption: {
          page,
        },
        category,
        cursor,
      },
    );

    return GetManyVoucherTagResponse.success(voucherTagList, page ?? 1);
  }

  // GET CATEGORY BY ID
  @ApiParam({ name: CATEGORIES_CONST.PARAM_ID })
  @SerializeOptions({
    groups: [RoleEnum.Admin, RoleEnum.User],
  })
  @Get(CategoryPath.GetCategoryById)
  async getCategoryById(
    @Param(CATEGORIES_CONST.PARAM_ID) id: CategoryDomain['id'],
  ): Promise<GetCategoryByIdResponse> {
    const category = await this.categoryService.getById(id);
    return GetCategoryByIdResponse.success(category);
  }
}
