import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService, 
  ){
    
    this.defaultLimit = configService.get<number>('defaultLimit');

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    }catch(error){
      if(error.code === 11000){
        this.handleExceptions(error);
      }
    }    
  }

  findAll(paginationDto: PaginationDto) {

    //console.log(+process.env.DEFAULT_LIMIT);
    const {limit = this.defaultLimit, offset =0}=paginationDto;

    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    //Para ordenar
    .sort({
      no: 1
    })
    //Para desaparecer un atributo
    .select('-__v')
  }

  async findOne(term: string) {

    let pokemon : Pokemon;
    //Buscar por no
    if( !isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }
    //Buscar por Mongo ID
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }
    //Buscar por Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
    }
    //No existe el pokemon
    if (!pokemon){
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)
    }

    return pokemon;
    //return `This action returns a #${id} pokemon`;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    
    try{
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
    }catch(error){
      this.handleExceptions(error);
    }
    
  }

  async remove(id: string) {
    //const pokemon = await this.findOne(id);
    //await pokemon.deleteOne();
    //return {id};
    //const result = await this.pokemonModel.findByIdAndDelete(id);
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id})
    if (deletedCount ===0){
      throw new BadRequestException(`pokemon with Id "${id}" not found`)
    }
    return;

  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon with id, name or no ${JSON.stringify(error.keyValue)} exist in db`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`)
  }


  
}
