import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

type Direction = 'U' | 'D' | 'L' | 'R';

/** Parse the raw input string and return an array of single-step directions */
function parseInput( input: string ): Direction[] {
    return input.split( '\n' ).map(
        line => new Array( parseInt(line.substring(2)) ).fill( line[0] )
    ).flat();
}

function simulate( directions: Direction[], numKnots: number ) {
    // keep track of the positions of the rope knots with an infinite x,y coordinate system. All knots start at [0, 0]
    let knots: number[][] = new Array( numKnots ).fill( 0 ).map( _ => [ 0, 0 ] );
    const tailHistory = new Set();
    const addToHistory = coords => tailHistory.add( JSON.stringify(coords) );
    addToHistory( [0, 0] );

    const diffs = {
        U: [ 0, 1 ],
        D: [ 0, -1 ],
        L: [ -1, 0 ],
        R: [ 1, 0 ]
    };
    directions.forEach( direction => {
        // move the head of the rope first
        knots[0] = [ knots[0][0] + diffs[direction][0], knots[0][1] + diffs[direction][1] ];
        // move each subsequent knot of the rope according to where the previous knot is
        for ( let i = 1; i < knots.length; i++ ) {
            // if the knot is at least 2 spaces away on either axis, move it toward the previous knot 1 space on each axis.
            const axisDiffs = knots[i - 1].map( (val, j) => val - knots[i][j] );
            const absAxisDiffs = axisDiffs.map( Math.abs );
            if ( absAxisDiffs.some(diff => diff > 1) ) {
                knots[i] = knots[i].map(
                    ( val, j ) => val + axisDiffs[j]/( absAxisDiffs[j] || 1 )
                );
            }
        }
        // Keep track of the movement history of only the very last knot
        addToHistory( knots[knots.length - 1] );
    });

    return tailHistory.size;
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => simulate( parseInput(input), 2 ), // function that solves part 1
    ( input: string ) => simulate( parseInput(input), 10 ) // function that solves part 2
);
