import { chunk, flatten, intersection, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

// a sack has two compartments, and each compartment has items identified by a number (their "priority")
type Sack = [ number[], number[] ];

function parseInput( input: string ): Sack[] {
    return input.split( '\n' ).map( line => {
        const items = line.split( '' ).map( letter => {
            // Convert the letter to a priority. CharCodes in javascript: a-z maps to 97-122, and A-Z maps to 65-90
            // convert these to ranges of 1-26 and 27-52.
            const charCode = letter.charCodeAt( 0 );
            return charCode - ( charCode >= 97 ? (97 - 1) : (65 - 27) );
        });
        return chunk( items, items.length / 2 ) as Sack;
    });
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => sum(
        parseInput( input ).map(
            sack => intersection( sack[0], sack[1] )[0]
        )
    ),
     // function that solves part 2
    ( input: string ) => sum(
        chunk( parseInput(input), 3 )
        .map(
            group => intersection( ...group.map(flatten) )[0]
        )
    )
);
