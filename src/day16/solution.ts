import { curryRight } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

interface IValve {
    label: string,
    flowRate: number,
    tunnels: string[]
}

const startValve = 'AA'
const Graph = require( 'node-dijkstra' );

/**
 * Parses the input, creating a graph of the tunnels and returning info on the valves, an array of valves that have positive flow, and
 * a function to get the distance between any two valves.
 */
function parseInput( input: string ) {
    // build a graph so we can find the shortest path from one valve to another
    const route = new Graph();

    const valves: IValve[] = input.split( '\n' ).map( line => {
        const matches = line.match( /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)/ );
        const valve = {
            label: matches[1],
            flowRate: Number( matches[2] ),
            tunnels: matches[3].split( ', ' )
        };
        route.addNode( valve.label, new Map(valve.tunnels.map(t => [t, 1])) );
        return valve;
    });

    // caches the shortest distances between two points. The string key should be like 'AA,BB'
    const distances = new Map<string,number>();

    // returns distance between two points on the graph, using a cached value if possible
    const getDistance = ( a: string, b: string ): number => {
        let d = distances.get( `${a},${b}` );
        if ( d == null ) {
            d = ( route.path( a, b )?.length ?? 1 ) - 1;
            distances.set( `${a},${b}`, d );
        }
        return d;
    };

    return {
        allValves: valves,
        valvesWithFlow: valves.filter ( v => v.flowRate > 0 ),
        getDistance: getDistance
    };
}

/**
 * Returns the most pressure I can release, given a set of closed valves and remaining minutes. One iteration per instance of moving to
 * a valve and opening it
 */
function bestChoice( closedValvesWithFlow: IValve[], m: number, position: string, getDistanceFn ): number {
    if ( m < 2 ) { // it takes >= two minutes to move to a valve and open it - if the time is over by that point, the valve didn't help
        return 0;
    }
    return Math.max(
        0,
        ...closedValvesWithFlow.map( v => {
            // calculate how long it would take to get to this valve and how much total pressure it would release in the remaining minutes
            const distance = getDistanceFn( position, v.label );
            return {
                d: distance,
                totalFlow: ( m - distance ) * v.flowRate,
                valve: v
            };
        }).filter(
            v => v.totalFlow > 0
        ).map(
            (c, i, choices) => c.totalFlow + bestChoice(
                choices.filter( c2 => c2 !== c ).map( c2 => c2.valve ),
                m - c.d - 1,
                c.valve.label,
                getDistanceFn
            )
        )
    );
}

/** returns all possible combinations of sample size n in the given array */
function getCombos<T>( arr: T[], n: number ): T[][] {
    if ( n === 1 ) {
        return arr.map( a => [a] );
    }
    let combos: T[][] = [];
    for ( let i = 0; i <= arr.length - n; i++ ) {
        combos = combos.concat(
            getCombos( arr.slice(i+1), n - 1 ).map( c => [arr[i]].concat(c) )
        );
    }
    return combos;
}


outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => {
        const parsed = parseInput( input );
        let m = 29; // actual number of minutes available minus 1, because actions during the last minute don't matter
        return bestChoice( parsed.valvesWithFlow, m, startValve, parsed.getDistance );
    },
     // function that solves part 2
    ( input: string ) => {
        // For every combination of splitting half the valves with the elephant, find the most pressure that can be released by me and add
        // it with the most pressure that can be released by the elephant. Return the max of that total over all combos.

        const parsed = parseInput( input );
        let m = 25; // actual number of minutes available minus 1, because actions during the last minute don't matter

        // if there's an odd number of valves, account for it later
        let extraValve;
        if ( parsed.valvesWithFlow.length % 2 === 1 ) {
            extraValve = parsed.valvesWithFlow.shift();
        }
        // The returned array of combos is symmetric - the inverse of the first combo equals the last combo. The inverse of the second combo
        // equals the second to last combo, etc. If I take the first half of the combos and the elephant takes a reversed array of the second
        // half of the combos, the valves we're each responsible for are mutually exclusive.
        const combos = getCombos( parsed.valvesWithFlow, parsed.valvesWithFlow.length / 2 );
        const myCombos = combos.slice( 0, combos.length / 2 );
        const elephantCombos = combos.slice( combos.length / 2 ).reverse();
        const totalFlows = [];

        const curriedBestChoice = curryRight( bestChoice )( parsed.getDistance )( startValve )( m );
        if ( extraValve == null ) {
            myCombos.forEach( (_, i) => {
                totalFlows.push( curriedBestChoice(myCombos[i]) + curriedBestChoice(elephantCombos[i]) );
            });
        } else {
            // first try with adding the extra valve to my combos, then with adding the extra valve to the elephant's combos
            myCombos.forEach( (_, i) => {
                totalFlows.push( curriedBestChoice(myCombos[i].concat(extraValve)) + curriedBestChoice(elephantCombos[i]) );
                totalFlows.push( curriedBestChoice(myCombos[i]) + curriedBestChoice(elephantCombos[i].concat(extraValve)) );
            });
        }

        return Math.max( ...totalFlows );
    }
);
