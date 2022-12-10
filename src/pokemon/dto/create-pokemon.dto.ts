import { IsInt, IsPositive, IsString, Min, MinLength, } from "class-validator";

export class CreatePokemonDto {

    @IsInt()
    @IsPositive({message: "The number must be a positive number"})
    @Min(1, {message:'The number must be more tha one caracter'} )
    no: number;

    @IsString({message: 'The name must be a String'})
    @MinLength(1, {message:'The name must be more than a caracter'} )
    name:string;
}
