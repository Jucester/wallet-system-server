import { Controller, Body, Post, Get, Param, Put, Delete, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { UsersService } from '../../../application/services/users.service'
import { CreateUserDto } from '../../../domain/dto/create-user.dto'
import { UpdateUserDto } from '../../../domain/dto/update-user.dto'

import { JwtAuthGuard } from '../../../../auth/infrastructure/passport/guards/jwt-auth.guard'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  // @Get()
  // async all(@Query() queryPagination: QueryPaginationDto) {
  //   return await this._usersService.find({ queryPagination })
  // }

  @Get()
  async all(@Query() queryPagination: QueryPaginationDto, @Query('quick-search') quickSearch?: string) {
    return await this._usersService.findCustom({ queryPagination, quickSearch })
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this._usersService.create(body)
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return await this._usersService.findById(id)
  }

  @Put(':id')
  async updateById(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserDto) {
    return await this._usersService.updateById(id, body)
  }

  @Delete(':id')
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    return await this._usersService.deleteById(id)
  }
}
