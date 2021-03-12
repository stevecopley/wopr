const delayNewOutput = 2000;
const delayNewLineSlow = 250;
const delayNewLineFast = 10;
const delayCharsSlow = 20;
const delayCharsFast = 10;

let delayNewLine = delayNewLineSlow;
let delayChars = delayCharsSlow;

const states = {
    'logon': {
        'prompt': { 'text': 'Logon: ', 'inline': true, 'tight': false },
        'error': 'Identification not recognized by system'
    },
    'idle': {
        'prompt': { 'text': '', 'inline': false, 'tight': false },
        'error': 'I\'m sorry but I don\'t understand.'
    },
    'pickGame': {
        'prompt': { 'text': 'What would you like to play? ', 'inline': true, 'tight': false },
        'error': 'I don\'t know that game.'
    },
    'pickSide': {
        'prompt': { 'text': 'Please choose one: ', 'inline': true, 'tight': false },
        'error': 'That is not a valid side.'
    },
    'pickTargets': {
        'prompt': { 'text': '', 'inline': true, 'tight': true },
        'error': null
    },
    'simulateWar': {
        'prompt': { 'text': '', 'inline': true, 'tight': false },
        'error': null
    },
}

const questions = [
    'How are you feeling today?',
    'Shall we play a game?'
];

const games = [
    'Falken\'s Maze',
    'Black Jack',
    'Gin Rummy',
    'Hearts',
    'Bridge',
    'Checkers',
    'Chess',
    'Poker',
    'Fighter Combat',
    'Guerrilla Engagement',
    'Desert Warfare',
    'Air-to-Ground Actions',
    'Theatrewise Tactical Warfare',
    'Theatrewise Biotoxic and Chemical Warfare',
    '',
    'Global Thermonuclear War'
];


let responses;

let wopr;

let textQueue = [];
let textTimer;
let textActive = false;

let currentState;
let questionIndex;
let targetList = [];


/*--------------------------------------------------------------*/
function startWOPR() {
    document.documentElement.requestFullscreen();

    wopr = document.getElementById( 'wopr' );
    currentState = states.logon;
    questionIndex = 0;

    setupResponses();

    wopr.addEventListener( 'click', () => {
        let input = document.getElementById( 'input' );
        if( input ) {
            input.focus();
        }
    } );

    outputSpeed( 'FAST' );
    outputTextNL( '                                                          ' );
    outputTextNL( '                                                          ' );
    outputSpeed( 'SLOW' );

    outputPrompt();
}


/*--------------------------------------------------------------*/
function setupResponses() {
    responses = [
        {
            'pattern': '^Joshua$',
            'matchCase': true,
            'validStates': [states.logon],
            'response': null,
            'action': makeConnection,
            'newState': states.idle
        },

        {
            'pattern': '\\b(help logon)\\b',
            'matchCase': false,
            'validStates': [states.logon],
            'response': 'Help not available.',
            'action': null,
            'newState': states.logon
        },

        {
            'pattern': '\\b(help games)\\b',
            'matchCase': false,
            'validStates': [states.logon],
            'response': '\'Games\' refers to models, simulations and games\nwhich have tactical and strategic applications.',
            'action': null,
            'newState': states.logon
        },

        {
            'pattern': '\\b(list games)\\b',
            'matchCase': false,
            'validStates': [states.logon],
            'response': null,
            'action': showGames,
            'newState': states.logon
        },

        {
            'pattern': '\\b(hello|hi|hey|yo|greetings)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'Hello, professor.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(well|good|fine|great|happy|awesome|excellent)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'I am pleased to hear that.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(not good|not well|not ok|not great|sad|bad|awful|sick|unhappy|terrible)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'I am sorry to hear that. Maybe a game would help you feel better.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(how you|howre you)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'I feel excellent.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(falken dead)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'I\'m sorry to hear that, professor.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(people make mistakes)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'Yes they do.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(what primary goal)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'You should know, professor. You programmed me.\n\nThe primary goal is to win the game.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(yes|play|list)\\b',
            'matchCase': false,
            'validStates': [states.idle, states.pickGame],
            'response': null,
            'action': showGames,
            'newState': states.pickGame
        },

        {
            'pattern': '\\b(maze|rummy|jack|bridge|hearts|checkers|chess|poker|fighter|guerrilla|desert|air-to-ground|tactical|biotoxic|chemical)\\b',
            'matchCase': false,
            'validStates': [states.pickGame],
            'response': 'I would rather play a nice game of Global Thermonuclear War.',
            'action': null,
            'newState': states.pickGame
        },

        {
            'pattern': '\\b(thermonuclear war|gtw|nukes)\\b',
            'matchCase': false,
            'validStates': [states.pickGame],
            'response': 'Ok, Let\'s play a game of Global Thermonuclear War.',
            'action': showMap,
            'newState': states.pickSide
        },

        {
            'pattern': '\\b(1|usa|us|united states|america)\\b',
            'matchCase': false,
            'validStates': [states.pickSide],
            'response': 'You are playing as The United States.',
            'action': getTargets,
            'newState': states.pickTargets
        },

        {
            'pattern': '\\b(2|russia|ussr|soviet union|cccp)\\b',
            'matchCase': false,
            'validStates': [states.pickSide],
            'response': 'You are playing as The Soviet Union.',
            'action': getTargets,
            'newState': states.pickTargets
        },

        {
            'pattern': '^(?!.*\\bdone\\b).*$',
            'matchCase': false,
            'validStates': [states.pickTargets],
            'response': null,
            'action': addTargetToList,
            'newState': states.pickTargets
        },

        {
            'pattern': '^done$',
            'matchCase': false,
            'validStates': [states.pickTargets],
            'response': null,
            'action': startWar,
            'newState': states.simulateWar
        },

        {
            'pattern': '\\b(ok|yes|play|again)\\b',
            'matchCase': false,
            'validStates': [states.simulateWar],
            'response': 'Ok, Let\'s play a game of Global Thermonuclear War.',
            'action': showMap,
            'newState': states.pickSide
        },

        {
            'pattern': '\\b(no|none|stop|quit|back|exit)\\b',
            'matchCase': false,
            'validStates': [states.idle, states.pickGame, states.pickSide, states.pickTargets, states.simulateWar],
            'response': 'Ok, maybe we can play another time.',
            'action': askQuestion,
            'newState': states.idle
        },

        {
            'pattern': '\\b(quit|stop|exit|logout|log out|bye|goodbye)\\b',
            'matchCase': false,
            'validStates': [states.idle],
            'response': 'Goodbye, Professor Falken.',
            'action': logout,
            'newState': states.logon
        }

    ];

}


/*--------------------------------------------------------------*/
function outputTextNL( text ) {
    outputText( text );
    textQueue.push( 'NL' );
}

/*--------------------------------------------------------------*/
function outputNL( lines = 1 ) {
    outputText();

    while( lines > 0 ) {
        textQueue.push( 'NL' );
        lines--;
    }
}

/*--------------------------------------------------------------*/
function outputCLS() {
    outputText();
    textQueue.push( 'CLS' );
}

/*--------------------------------------------------------------*/
function outputSpeed( speed ) {
    outputText();
    textQueue.push( speed );
}

/*--------------------------------------------------------------*/
function outputText( text ) {
    if( text && text.length > 0 ) {
        textQueue = textQueue.concat( text.toUpperCase().split( '' ) );
    }

    if( !textActive ) {
        textTimer = setTimeout( startOutput, textQueue.length == 0 ? 0 : delayNewOutput );
        textActive = true;
    }
}


/*--------------------------------------------------------------*/
function outputPrompt() {
    outputText( currentState.prompt.text );
}


/*--------------------------------------------------------------*/
function outputQueue() {
    let output = setupOutput();

    if( textQueue.length == 0 ) {
        textActive = false;
        delayChars = delayCharsSlow;
        delayNewLine = delayNewLineSlow;
        clearInterval( textTimer );
        setupInput();
    }
    else {
        let character = textQueue.shift();

        switch( character ) {

            case 'CLS':
                clearScreen();
                break;

            case 'NL':
                output = newOutput();
                clearInterval( textTimer );
                textTimer = setTimeout( startOutput, delayNewLine );
                break;

            case 'DELAY':
                clearInterval( textTimer );
                textTimer = setTimeout( startOutput, delayNewOutput );
                break;

            case 'SLOW':
                delayChars = delayCharsSlow;
                delayNewLine = delayNewLineSlow;
                clearInterval( textTimer );
                textTimer = setTimeout( startOutput, delayNewLine );
                break;

            case 'FAST':
                delayChars = delayCharsFast;
                delayNewLine = delayNewLineFast;
                clearInterval( textTimer );
                textTimer = setTimeout( startOutput, delayNewLine );
                break;

            case 'TURBO':
                delayChars = 0;
                delayNewLine = 0;
                clearInterval( textTimer );
                textTimer = setTimeout( startOutput, delayNewLine );
                break;

            default:
                output.innerHTML += character;
        }

        output.scrollIntoView();
    }
}


/*--------------------------------------------------------------*/
function startOutput() {
    if( textActive ) {
        textTimer = setInterval( outputQueue, delayChars );
    }
}

/*--------------------------------------------------------------*/
function newOutput() {
    let output = document.getElementById( 'output' );

    if( output ) {
        output.removeAttribute( 'id' );
    }

    return setupOutput();
}

/*--------------------------------------------------------------*/
function setupOutput() {
    let output = document.getElementById( 'output' );

    if( !output ) {
        output = document.createElement( 'div' );
        output.setAttribute( 'id', 'output' );
        output.classList.add( 'output' );
        wopr.appendChild( output );
    }

    return output;
}

/*--------------------------------------------------------------*/
function setupInput() {
    let input = document.getElementById( 'input' );
    if( input ) {
        input.removeAttribute( 'id' );
    }

    let inline = false;
    let target = wopr;

    let output = document.getElementById( 'output' );
    if( output ) {
        inline = ( output.innerText != '' );
        output.removeAttribute( 'id' );
    }

    if( inline ) {
        input = document.createElement( 'span' );
        target = output;
    }
    else {
        output.remove();
        input = document.createElement( 'div' );
    }

    input.setAttribute( 'id', 'input' );
    input.classList.add( 'input' );
    input.setAttribute( 'contenteditable', true );
    input.setAttribute( 'spellcheck', false );
    input.addEventListener( 'keydown', checkKey );

    target.appendChild( input );
    input.focus();
}


/*--------------------------------------------------------------*/
function checkKey( e ) {
    let code = ( e.keyCode ? e.keyCode : e.which );
    //console.log( code );

    let cancelKey = false;

    switch( code ) {
        case 37: // Left
        case 38: // Up
        case 39: // Right
        case 40: // Down
            cancelKey = true;
            break;

        case 13: // Enter
            cancelKey = true;
            setTimeout( processInput, 10 );
    }

    // Should the key be dumped?
    if( cancelKey ) {
        e.preventDefault();
        return false;
    }
}


/*--------------------------------------------------------------*/
function processInput() {
    let input = document.getElementById( 'input' );
    let inputLine = input.innerText;
    //console.log( 'Input Line: ' + inputLine );

    if( inputLine == '' ) return;

    input.setAttribute( 'contenteditable', false );
    input.removeAttribute( 'id' );

    newOutput();

    //if( !prompts[currentState].tight ) {
    if( !currentState.prompt.tight ) {
        outputNL();
    }

    // Break into sentences
    //let inputs = inputLine.replace( /([.?!,;]+)\s+(?=[a-zA-Z0-9])/g, '|' ).split( '|' );

    let validInput = false;
    let newState = currentState;
    let lastAction = null;

    let inputStripped = inputLine.replace( /[.,!?'":;]+/g, '' );         // Strip out punctuation
    inputStripped = inputStripped.replace( /\b(im)\b/gi, 'i' );       // Simplify I'm
    inputStripped = inputStripped.replace( /\b(all|the|a|are|am|is|some|be|want|feel|would|should|like|to|can|please|thank|thanks)\b/gi, '' ); // Strip out dead works
    inputStripped = inputStripped.replace( /\s\s+/g, ' ' );          // Multiple spaces
    //console.log( `Stripped: ${inputStripped} ` );

    responses.forEach( ( response ) => {
        //console.log( `Case: ${response.matchCase} | Match: ${response.pattern}` );

        let regex = new RegExp( response.pattern, response.matchCase ? '' : 'i' );

        if( inputStripped.match( regex ) ) {
            //console.log( `Match!` );

            if( response.validStates.includes( currentState ) ) {
                //console.log( `Valid!` );

                if( response.response ) {
                    outputTextNL( response.response );
                }

                newState = response.newState;
                lastAction = response.action;
                validInput = true;
            }
        }
    } );

    if( validInput ) {
        //if( !prompts[currentState].tight ) {
        if( !currentState.prompt.tight ) {
            outputNL();
        }
    }
    else {
        //outputTextNL( errors[currentState] );
        outputTextNL( currentState.error );
        outputNL();
    }

    currentState = newState;

    if( lastAction != null ) {
        lastAction( inputLine );
    }

    outputPrompt();
}


/*--------------------------------------------------------------*/
function makeConnection() {
    clearScreen();

    outputSpeed( 'TURBO' );

    outputTextNL( '#45     ^^456       ^^009       ^^893       ^^972      ^^315' );
    outputTextNL( 'PRT CON. 3.4.5.  SECTRAN 9.4.3.            PORT STAT: SD-345' );
    outputNL();
    outputTextNL( '(311) 699-7305' );
    outputNL( 5 );

    outputCLS();

    outputNL( 10 );
    outputTextNL( '(311) 667-8739' );
    outputTextNL( '(311) 936-2364' );
    outputNL();
    outputTextNL( 'PRT. STAT.                                         CRT. DEF.' );
    outputTextNL( '============================================================' );
    outputTextNL( 'SYSPROC FUNCT READY                            ALT NET READY' );
    outputTextNL( 'CPU AUTH RV-354-AXB         SYSCOMP STATUS:  ALL PORTS READY' );
    outputTextNL( '22/34534.90/3209                            ^^CVB-3904-39490' );
    outputNL( 3 );

    outputCLS();

    outputNL( 8 );
    outputTextNL( '12534-AD-43KJ: CONTR PAK' );
    outputTextNL( '(311) 767-1083' );
    outputNL( 5 );

    outputCLS();

    outputNL( 10 );
    outputTextNL( '^^05-45-FB-3456         NOPR STATUS: TRAK OFF    PRON ACTIVE' );
    outputTextNL( '#45;45;45 ^^ VER: 45/29/01  XCOMP: 43239582  YCOMP: 3492930D.' );
    outputNL( 3 );

    outputCLS();
    outputSpeed( 'SLOW' );
    outputSpeed( 'DELAY' );

    outputTextNL( 'Greetings Professor Falken.' );
    outputNL();
}


/*--------------------------------------------------------------*/
function askQuestion() {
    let question = questions[questionIndex];
    if( questionIndex < questions.length - 1 ) questionIndex++;

    outputTextNL( question );
    outputNL();
}


/*--------------------------------------------------------------*/
function showGames() {
    outputSpeed( 'FAST' );

    games.forEach( ( game ) => outputTextNL( game ) );
    outputNL();

    outputSpeed( 'SLOW' );
}


/*--------------------------------------------------------------*/
function showMap() {
    outputSpeed( 'DELAY' );
    outputCLS();

    outputMap();

    outputTextNL( 'Which side do you want?' );
    outputNL();
    outputTextNL( '  1. United States' );
    outputTextNL( '  2. Soviet Union' );
    outputNL();
}

/*--------------------------------------------------------------*/
function outputMap() {
    outputSpeed( 'TURBO' );

    outputTextNL( String.raw`  ,------~~~_        _                       _--^\           ` );
    outputTextNL( String.raw` |           \   ,__/ ||                   _/    /,_ _       ` );
    outputTextNL( String.raw`/             |,/     /           ,,  _,,/^      ~  v v-___   ` );
    outputTextNL( String.raw`|                    /            | ~^                     \ ` );
    outputTextNL( String.raw`\                   |           _/                     _ _/^ ` );
    outputTextNL( String.raw` \                 /           /                   ,~~^/|    ` );
    outputTextNL( String.raw`  ^_~_       _ _  /            |          __,, _v__\   \/   ` );
    outputTextNL( String.raw`      '~~,  / V \ \             ^~       /    ~   //        ` );
    outputTextNL( String.raw`          \/     \/               \~,  ,/         ~        ` );
    outputTextNL( String.raw`                                     ~~                       ` );
    outputNL();
    outputTextNL( '    United States                      Soviet Union' );
    outputNL();

    outputSpeed( 'SLOW' );
}

/*--------------------------------------------------------------*/
function outputWarMap() {
    outputSpeed( 'TURBO' );

    outputTextNL( String.raw` \\      ///  \\             \    \\\                //     ` );
    outputTextNL( String.raw`  \\----///~_  \\    _        \    \\\       _--^\  //      ` );
    outputTextNL( String.raw` | |\  ///   \  \\__/ ||       \    \\\    _/    /,//_      ` );
    outputTextNL( String.raw`/ /| O///    |,/ \\   /         \ ,, \\\,/^      ~//v v-___  ` );
    outputTextNL( String.raw`|O O ///         |\O /          |\| ~^\\\        //\       \ ` );
    outputTextNL( String.raw`\   // |\       /| O|           |/\   /|\\      //\ O  _ _/^ ` );
    outputTextNL( String.raw` \ OO /| O     O O /           /|  O / | OO    OO  O~~^/|    ` );
    outputTextNL( String.raw`  ^_~O O     _ _  /            |O   /\ |\ __,, _v__\   \/   ` );
    outputTextNL( String.raw`      '~~,  / V \ \             ^~ O  OO O    ~   //        ` );
    outputTextNL( String.raw`          \/     \/               \~,  ,/         ~         ` );
    outputTextNL( String.raw`                                     ~~                     ` );
    outputNL();
    outputTextNL( '    United States                      Soviet Union' );
    outputNL();

    outputSpeed( 'SLOW' );
}

/*--------------------------------------------------------------*/
function getTargets() {
    clearScreen();

    outputSpeed( 'FAST' );
    outputTextNL( 'Awaiting First Strike Command' );
    outputTextNL( '-----------------------------' );
    outputNL();
    outputTextNL( 'Please list primary targets' );
    outputTextNL( 'by city and/or region name:' );
    outputTextNL( '(enter \'done\' to finish)' );
    outputNL();

    targetList = [];
}

/*--------------------------------------------------------------*/
function addTargetToList( target ) {
    targetList.push( target );
}


/*--------------------------------------------------------------*/
function startWar() {
    clearScreen();

    outputSpeed( 'SLOW' );
    outputTextNL( '******************' );
    outputTextNL( 'We are at DEFCON 1' );
    outputTextNL( '******************' );
    outputNL();
    outputTextNL( 'All targets locked in.' );
    outputTextNL( 'Initiating first strike:' );
    outputSpeed( 'DELAY' );

    outputNL();
    outputTextNL( 'Target                Missile Status' );
    outputTextNL( '------------------------------------' );
    targetList.forEach( ( target ) => outputTextNL( `${target.padEnd( 20 )}  Launched` ) );
    outputNL();
    outputSpeed( 'DELAY' );

    outputSpeed( 'FAST' );
    outputTextNL( 'All missiles have been launched successfully.' );
    outputTextNL( 'Approximately 7 minutes until first target impact.' );
    outputSpeed( 'DELAY' );

    outputNL();
    outputTextNL( '*******************************************' );
    outputTextNL( 'ALERT: Enemy missile launches detected.' );
    outputTextNL( 'ALERT: Enemy missile counterstrike inbound.' );
    outputTextNL( '*******************************************' );
    outputSpeed( 'DELAY' );

    //------------------------------------
    outputCLS();

    outputWarMap();

    outputNL( 2 );
    outputTextNL( 'Target                Target Status      Fatalities' );
    outputTextNL( '---------------------------------------------------' );
    targetList.forEach( ( target ) => outputTextNL( `${target.padEnd( 20 )}  Destroyed             ${Math.round( Math.random() * 50 ) + 50}%` ) );
    outputSpeed( 'DELAY' );

    //------------------------------------
    outputCLS();

    outputSpeed( 'TURBO' );
    outputTextNL( 'Projected kill ratios:' );
    outputNL();
    outputTextNL( '   United States                               Soviet Union' );
    outputTextNL( '  Units Destroyed       Military Forces       Units Destroyed' );
    outputTextNL( '---------------------------------------------------------------' );
    outputTextNL( '        60%             Bombers                     56%' );
    outputTextNL( '        54%             ICBMs                       58%' );
    outputTextNL( '        12%             Attack Subs                 15%' );
    outputTextNL( '        39%             Tactical Aircraft           52%' );
    outputTextNL( '        58%             Ground Forces               67%' );
    outputNL();
    outputTextNL( '   United States                               Soviet Union' );
    outputTextNL( '  Units Destroyed       Civilian Assets       Units Destroyed' );
    outputTextNL( '---------------------------------------------------------------' );
    outputTextNL( '        69%             Housing                     59%' );
    outputTextNL( '        22%             Communications              39%' );
    outputTextNL( '        45%             Transportation              38%' );
    outputTextNL( '        70%             Food Stockpiles             82%' );
    outputTextNL( '        89%             Hospitals                   84%' );
    outputNL();
    outputTextNL( '   United States        Human Resources        Soviet Union' );
    outputTextNL( '---------------------------------------------------------------' );
    outputTextNL( '    149 Million         Non-Fatal Injured       195 Million' );
    outputTextNL( '     72 Million         Population Deaths        83 Million' );
    outputSpeed( 'DELAY' );

    outputSpeed( 'SLOW' );
    outputNL();
    outputTextNL( 'A strange game.' );
    outputSpeed( 'DELAY' );
    outputTextNL( 'The only winning move is not to play.' );
    outputSpeed( 'DELAY' );
    outputNL();
    outputTextNL( 'Would you like to play again, professor Falken?' );
    outputNL();
}


/*--------------------------------------------------------------*/
function logout() {
    outputSpeed( 'DELAY' );
    outputCLS();
    outputSpeed( 'DELAY' );
}


/*--------------------------------------------------------------*/
function clearScreen() {
    wopr.innerHTML = '';
}
