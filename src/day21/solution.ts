import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/** Returns a map with keys being monkey names and values being their "operation" */
function parseInput( input: string ) {
    return new Map<string,string>(
        input.split( '\n' ).map( line => line.split(': ') ) as any
    );
}

function replace( monkeys: Map<string,string>, op: string ): string {
    // if the "operation" is a number, just return the number. Otherwise replace both parts of the operation
    const parts = op.split( ' ' );
    return op.match(/[+-/*=]/) == null ?
        op : `( ${replace(monkeys, monkeys.get(parts[0]))} ) ${parts[1]} ( ${replace(monkeys, monkeys.get(parts[2]))} )`;
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => {
        const monkeys = parseInput( input );
        return eval(
            replace( monkeys, monkeys.get('root') )
        );
    },
     // function that solves part 2
    ( input: string ) => {
        const monkeys = parseInput( input );
        monkeys.set( 'humn', 'x' );
        return require('nerdamer/all.min').solve(
            replace( monkeys, monkeys.get('root').replace('+', '=') ),
            'x'
        );
    }
);
