import { Module } from '@nestjs/common';
import { RolesService } from './roles/roles.service';
import { RolesController } from './roles/roles.controller';

@Module({
  providers: [RolesService],
  controllers: [RolesController],
})
export class RolesModule {}
