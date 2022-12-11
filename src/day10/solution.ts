import { last, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/** Returns an array that represents the value of X during each cycle (the first item is the value of X during the 0th cycle) */
function getCycleStates( input: string ): number[] {
    // add a blank line (which is equivalent to a noop) before every addx to represent the fact that addx takes two cycles.
    // Map each line to what the state of X is at the cycle labelled by that index.
    return input.replace( /addx/g, '\naddx' ).split( '\n' ).reduce( (states, line) => {
        return states.concat([ last(states) + parseInt(line.split(' ')[1] ?? '0') ]);
    }, [1, 1] ); // prepending extra 1's fixes off-by-one errors
}

/** Returns a string representing the display. Renders "on" (#) if the 3-pixel wide sprite at position x covers the pixel being rendered */
function draw( states: number[], screenWidth: number ) {
    // slice( 1 ) to get rid of the extra 0-indexed state. Add a newline at every 40th pixel then determine if the pixel is on or off
    return states.slice( 1 ).reduce( (output, x, i) => {
        return output + ( i % screenWidth === 0 ? '\n' : '' ) + ( Math.abs( (i % screenWidth) - x ) < 2 ? '#' : ' ' );
    }, '' );
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => sum(
        // get the "signal strength" by multiplying the value by the index, then get only the indexes at 20 and every 40th index after that
        getCycleStates( input ).map( (v, i) => v * i ).filter( (_, i) => i % 40 === 20 )
    ), // function that solves part 1
    ( input: string ) => draw( getCycleStates(input), 40 ) // function that solves part 2
);
