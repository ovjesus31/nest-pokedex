import { Module } from '@nestjs/common';
import { AxiosAdapter } from './adapters/axios.adpater';
import { PaginationDto } from './dto/pagination.dto';

@Module({

    providers: [AxiosAdapter],
    exports: [AxiosAdapter],

})
export class CommonModule {}
