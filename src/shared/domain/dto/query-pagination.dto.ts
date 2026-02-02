import { ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

@Exclude()
export class QueryPaginationDto {
  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : value))
  page: number

  @Expose()
  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : value))
  limit: number
}
