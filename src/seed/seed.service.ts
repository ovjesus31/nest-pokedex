import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adpater';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http:AxiosAdapter,
  ){}
   
  async excuteSeed(){

    await this.pokemonModel.deleteMany({});// Para borrar todos los registros de la tabla
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert: {name: string, no: number}[]= [];
    data.results.forEach(({name, url}) => {
      const segments = url.split('/')
      //console.log(segments) (Split Separa en un array los elementos)
      const no: number = +segments[segments.length - 2 ];
      pokemonToInsert.push({name, no});  
    });
    await this.pokemonModel.insertMany(pokemonToInsert);



// Otra Forma de Hacerlo
    //const insertPromisesArray =[]; 
    //data.results.forEach(({name, url}) => {
    //  const segments = url.split('/')
      //console.log(segments) (Split Separa en un array los elementos)
    //  const no: number = +segments[segments.length - 2 ];
    //  console.log({name, no}); // Para ver que estoy trayendo por consola
    //  insertPromisesArray.push( this.pokemonModel.create({name, no}));
      //const pokemon = await this.pokemonModel.create({name, no})   
    //});
    //await Promise.all(insertPromisesArray) // Esto resuleve las promesas



    return 'Seed Executed';
  }
   
}
