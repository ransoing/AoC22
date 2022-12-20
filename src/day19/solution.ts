import { range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';


/** the four indexes represent ore, clay, obsidian, and geode */
type Inventory = [ number, number, number, number ];

enum Resource {
    ore = 0,
    clay = 1,
    obsidian = 1,
    geode = 3
}

function getResourceIndex( resourceName: string ) {
    return [ 'ore', 'clay', 'obsidian', 'geode' ].indexOf( resourceName );
}

interface IBot {
    cost: Inventory,
    /** A number from 0-3 (inclusive). the yield represents what 'type' of bot this is, i.e. "ore robot" */
    yield: Resource
}

type Blueprint = IBot[];

// the maximum amount of something you can produce if you build a bot that produces that thing every minute.
// The index equates to the number of minutes remaining.
const maxProduction = range( 50 );
maxProduction.forEach( i => {
    maxProduction[i] = i <= 1 ? 0 : i - 1 + maxProduction[i - 1];
});

function parseInput( input: string ): Blueprint[] {
    return input.split( '\n' ).map( line => {
        // split by '.' but remove the last element because a period at the end causes the last element to be blank.
        return line.split( '.' ).slice( 0, -1 ).map( phrase => {
            const cost = [ 0, 0, 0, 0 ];
            Array.from( phrase.matchAll(/(\d+) ([^ ]+)/g) ).forEach( match => {
                cost[getResourceIndex(match[2])] = Number( match[1] );
            });
            return {
                yield: getResourceIndex( phrase.match( /Each (\w+?) / )[1] ),
                cost: cost
            } as unknown as IBot;
        });
    });
}

/** Returns the maximum number of each type of bot that I would ever need to build */
function findMaxNeededBots( blueprint: Blueprint ): Inventory {
    // I can only build one bot per minute. If the most expensive bot consumes n ore, I wouldn't need to harvest more than n ore per minute.
    // Find the maximum cost of each resource type across all bots
    return [
        ...range( 3 ).map(
            (_, i) => Math.max( ...blueprint.map(bot => bot.cost[i]) )
        ),
        // we always need more geode bots
        Number.MAX_SAFE_INTEGER
     ] as Inventory;
}

/** Returns the maximum number of geodes opened in the remaining time */
function countGeodesOpened( blueprint: Blueprint, botCount: Inventory, resources: Inventory, minutesLeft: number, maxNeededBots: Inventory, bestSiblingScore: number ): number {
    // The only decision we really make is which bot to build next. There's no advantage to NOT building any bot during the course of a
    // minute except to save enough resources to build a specific bot later. If we decide to build a bot that we don't have enough resources
    // for yet, then we wait until we do, and build it as soon as we can.
    // We simplify the depth-first-search tree by branching only on the decision of which bot to build next.

    const maxPossibleScore = botCount[Resource.geode] * minutesLeft + maxProduction[minutesLeft];
    if (
        ( minutesLeft < 5 && botCount[Resource.geode] === 0 ) ||
        ( maxPossibleScore <= bestSiblingScore )
    ) {
        return 0;
    }

    let bestChildScore = 0;
    // if we can build a geode bot, do so
    const geodeBot = blueprint[ blueprint.length - 1 ];
    const usefulBots = geodeBot.cost.every((c,i) => c <= resources[i]) ?
        [ geodeBot ] :
        blueprint.filter(
            // only include bots that are useful to build that we have also the resources to build
            bot => botCount[bot.yield] < maxNeededBots[bot.yield] && bot.cost.every( (amount, i) => amount === 0 || botCount[i] > 0 )
        );

    return Math.max(
        0,
        ...usefulBots.map( bot => {
            // calculate how many minutes we have to wait until we have enough resources to build this bot. Add 1 to the number of minutes
            // because it takes an additional minute before the bot is built
            const minutesToWait = 1 + Math.max( 0, ...bot.cost.map( (amount, i) => {
                // minutes left = resources we need / minutes to collect that amount. Each bot collects 1 resource/minute
                const numNeeded = amount - resources[i];
                return numNeeded > 0 ? Math.ceil( numNeeded / botCount[i] ) : 0;
            }));
            if ( minutesLeft - minutesToWait <= 0 ) {
                // We can't build this bot in time. Return the geodes opened in the remaining minutes
                return botCount[Resource.geode] * minutesLeft;
            } else {
                // accumulate resources and reduce by the bot cost
                const resourcesCopy = resources.slice() as Inventory;
                resourcesCopy.forEach( (amount, i) => resourcesCopy[i] += minutesToWait * botCount[i] - bot.cost[i] );
                // the bot has been built. Add it to the list going forward
                const botsCopy = botCount.slice() as Inventory;
                botsCopy[ bot.yield ]++;
                // return the amount of geodes opened during waiting time, plus the geodes opened after the next decision tree.
                // Keep track of the best option so far so we can prune options that can't possibly exceed that amount
                const addl = countGeodesOpened( blueprint, botsCopy, resourcesCopy, minutesLeft - minutesToWait, maxNeededBots, bestChildScore );
                bestChildScore = Math.max( bestChildScore, addl );
                return botCount[Resource.geode] * minutesToWait + addl;
            }
        })
    );
}

const t1 = new Date().getTime();

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => sum(
        parseInput( input ).map(
            (blueprint, i) => (i + 1) * countGeodesOpened( blueprint, [1,0,0,0], [0,0,0,0], 24, findMaxNeededBots(blueprint), 0 )
        )
    ),
    // function that solves part 2
    // takes up to a minute to process
    ( input: string ) => parseInput( input ).slice(0,3).map(
        blueprint => countGeodesOpened( blueprint, [1,0,0,0], [0,0,0,0], 32, findMaxNeededBots(blueprint), 0 )
    ).reduce(
        (total, openedGeodes) => total * openedGeodes, 1
    )
);

console.log( 'Seconds: ' + ( (new Date().getTime() - t1) / 1000 )  )
