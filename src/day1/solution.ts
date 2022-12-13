import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/** Takes raw puzzle input and returns a 2D array of numbers */
function parseInput( input: string ): number[][] {
    return input.split( '\n\n' ).map(
        numberList => numberList.split( '\n' ).map( Number )
    );
}

/** Finds the total calories carried by the top `n` calorie carriers */
function sumHighestCalorieCarriers( rawInput: string, n: number ): number {
    // parse the input, add up the calories carried by each elf, sort the elves by descending calories, and sum the first n
    return sum(
        parseInput( rawInput ).map( sum ).sort( (a,b) => b - a ).slice( 0, n )
    );
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => sumHighestCalorieCarriers( input, 1 ), // function that solves part 1
    ( input: string ) => sumHighestCalorieCarriers( input, 3 )  // function that solves part 2
);
