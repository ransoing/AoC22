import { range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string, decryptionKey: number = 1, mixLoops: number = 1 ) {
    // return an object with the number value inside it. This way, duplicate number values won't throw us off since the resulting array
    // is an array of unique pointers, not an array of numeric values.
    const nums = input.split( '\n' ).map( n => {
        return {
            value: Number( n ) * decryptionKey
        }
    });

    // use slice to make a copy of the array in its original order, then loop through the numbers and change their positions in the array
    const originalNums = nums.slice();
    range( mixLoops ).forEach( () => {
        originalNums.forEach( num => {
            // remove the number
            const originalIndex = nums.indexOf( num );
            nums.splice( originalIndex, 1 );
            // find the new position, accounting for wrapping around indefinitely
            const mod = ( originalIndex + num.value ) % nums.length;
            nums.splice( mod >= 0 ? mod : nums.length + mod, 0, num );
        });
    });

    return sum(
        [ 1000, 2000, 3000 ].map( i => nums[ (i + nums.findIndex(n => n.value === 0) ) % nums.length ].value )
    );
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => parseInput( input ),
     // function that solves part 2
    ( input: string ) => parseInput( input, 811589153, 10 )
);
