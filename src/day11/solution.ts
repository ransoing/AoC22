import { multiply, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

interface IMonkey {
    items: number[];
    op: (v: number) => number;
    /** three numbers describing what to divide the stress level by, and which monkeys to throw to if the test passes/fails */
    test: number[];
    inspections: number;
}

function parseInput( input: string ): IMonkey[] {
    return input.split( '\n\n' ).map(
        // return an object with properties, representing the monkey.
        p => {
            // remove newlines before "If" statements to make it easier to parse the test and throw
            const lines = p.replace( /\n.+If/g, '' ).split( '\n' );
            const toNums = line => line.match( /\d+/g )?.map( Number );
            return {
                items: toNums( lines[1] ),
                op: old => eval( eval(lines[2].split('=')[1]) ),
                test: toNums( lines[3] ),
                inspections: 0
            };
        }
    );
}

function simulate( monkeys: IMonkey[], rounds: number, worryDivisor: number ): IMonkey[] {
    // to prevent numbers from getting too big for js to handle, find a common denominator to divide stress numbers by, which won't mess
    // up the monkey.test functions
    const stressManagementDivisor = monkeys.reduce( (total, m) => total * m.test[0], 1 );
    range( rounds ).forEach( () => {
        monkeys.forEach( monkey => {
            monkey.items.forEach( item => {
                item = Math.floor( monkey.op(item) / worryDivisor ) % stressManagementDivisor;
                monkeys[ item % monkey.test[0] === 0 ? monkey.test[1] : monkey.test[2] ].items.push( item );
                monkey.inspections++;
            });
            monkey.items = [];
        });
    });

    return monkeys;
}

function findBusinessLevel( input: string, rounds: number, worryDivisor: number ): number {
    return multiply.apply(
        null,
        simulate( parseInput(input), rounds, worryDivisor ).map( m => m.inspections ).sort( (a, b) => b - a ).slice( 0, 2 )
    );
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => findBusinessLevel( input, 20, 3 ), // function that solves part 1
    ( input: string ) => findBusinessLevel( input, 10000, 1 ) // function that solves part 2
);
