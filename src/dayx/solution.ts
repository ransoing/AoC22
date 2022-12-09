import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string ) {
    
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => null, // function that solves part 1
    ( input: string ) => null // function that solves part 2
);
