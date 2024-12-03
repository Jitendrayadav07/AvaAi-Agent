require('dotenv').config();
const { ethers } = require('ethers');

const DataSource = require('loopback-datasource-juggler').DataSource;
let bluebird = require('bluebird');


const dataSource = new DataSource({
    connector: require('loopback-connector-mysql'),
    host: process.env.HOST,
    port: process.env.PORT,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    user: process.env.USER_NAME,
    charset: 'utf8mb4',  // Ensures utf8mb4 is used
    collation: 'utf8mb4_unicode_ci'
});

let getmysqlquery = async function (query, values) {
    return new bluebird.Promise(function (resolve, reject) {
        dataSource.connector.query(query, values, function (err, results) {
            if (err) {
                console.error('Database Error:', err);
                return resolve(false);
            }
            resolve(results);
        });
    });
};

// Connect to the Avalanche C-Chain
const provider = new ethers.providers.JsonRpcProvider(process.env.AVAX_RPC_URL);

// Reuse the same constants from arenaMonitor.js
const ARENA_ADDRESS = '0xb8d7710f7d8349a506b75dd184f05777c82dad0c';
const ARENA_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
];

const TRADER_JOE_ABI = [
    'function addLiquidityNATIVE(tuple(address tokenX, address tokenY, uint256 binStep, uint256 amountX, uint256 amountY, uint256 amountXMin, uint256 amountYMin, uint256 activeIdDesired, uint256 idSlippage, int256[] deltaIds, uint256[] distributionX, uint256[] distributionY, address to, address refundTo, uint256 deadline) liquidityParameters) payable returns (uint256 amountXAdded, uint256 amountYAdded, uint256 amountXLeft, uint256 amountYLeft, uint256[] depositIds, uint256[] liquidityMinted)',
    'function removeLiquidityNATIVE(address token, uint16 binStep, uint256 amountTokenMin, uint256 amountNATIVEMin, uint256[] ids, uint256[] amounts, address payable to, uint256 deadline) returns (uint256 amountToken, uint256 amountNATIVE)',
    'function swapExactTokensForNATIVE(uint256 amountIn, uint256 amountOutMinNATIVE, tuple(uint256[] pairBinSteps, uint8[] versions, address[] tokenPath) path, address payable to, uint256 deadline) returns (uint256 amountOut)',
    'function swapExactNATIVEForTokens(uint256 amountOutMin, tuple(uint256[] pairBinSteps, uint8[] versions, address[] tokenPath) path, address to, uint256 deadline) payable returns (uint256 amountOut)',
    'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, tuple(uint256[] pairBinSteps, uint8[] versions, address[] tokenPath) path, address to, uint256 deadline) returns (uint256 amountOut)'
];

const KNOWN_ADDRESSES = {
    '0x18556DA13313f3532c54711497A8FedAC273220E': {
        name: 'Trader Joe',
        abi: TRADER_JOE_ABI,
        functions: {
            addLiquidityNATIVE: 'Add Liquidity',
            removeLiquidityNATIVE: 'Remove Liquidity',
            swapExactTokensForNATIVE: 'Swap Arena for AVAX',
            swapExactNATIVEForTokens: 'Swap AVAX For Arena',
            swapExactTokensForTokens: 'Swap Tokens For Tokens'
        }
    }
};

async function getArenaTransactionHistory(startBlock, endBlock) {
    console.log('Fetching ARENA transaction history...');
    
    const arenaContract = new ethers.Contract(ARENA_ADDRESS, ARENA_ABI, provider);
    
    // Get token details
    const [decimals, symbol] = await Promise.all([
        arenaContract.decimals(),
        arenaContract.symbol()
    ]);

    // Create filter for Transfer events
    const filter = arenaContract.filters.Transfer();
    
    // Get all transfer events between blocks
    const events = await arenaContract.queryFilter(filter, startBlock, endBlock);
    
    // Process each event
    for (const event of events) {
        try {
            const { from, to, value } = event.args;
            const formattedAmount = ethers.utils.formatUnits(value, decimals);
            const tx = await provider.getTransaction(event.transactionHash);
            
            const dexInfo = KNOWN_ADDRESSES[tx.to];
            if (dexInfo) {
                const iface = new ethers.utils.Interface(dexInfo.abi);
                
                let functionName = 'Unknown';
                try {
                    const decodedData = iface.parseTransaction({ data: tx.data });
                    functionName = dexInfo.functions[decodedData.name] || decodedData.name;
                    
                    if (decodedData.name === 'swapExactTokensForTokens') {
                        const tokenPath = decodedData.args.path.tokenPath;
                        if (tokenPath[0].toLowerCase() === ARENA_ADDRESS.toLowerCase()) {
                            functionName = 'Swap ARENA For Tokens';
                        } else if (tokenPath[tokenPath.length - 1].toLowerCase() === ARENA_ADDRESS.toLowerCase()) {
                            functionName = 'Swap Tokens For ARENA';
                        }
                    }

                    const block = await event.getBlock();
                    
                    const epochTime = Math.floor(new Date(block.timestamp * 1000).getTime() / 1000);
                    const arean_data = `SELECT transaction_hash FROM tbl_arena_transactions WHERE transaction_hash = ?`;
                    const transaction_hash_data = [event.transactionHash];
                    const existingTransaction = await getmysqlquery(arean_data, transaction_hash_data);

                    if (existingTransaction && existingTransaction.length > 0) {
                        console.log(`Transaction ${event.transactionHash} already exists, skipping...`);
                        continue;
                    }

                    // Insert new transaction
                    const insertQuery = `INSERT INTO tbl_arena_transactions 
                    (transaction_hash, from_address, to_address, amount, dex, function_called, block_number, timestamp ,epoch_time) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    const insertValues = [
                        event.transactionHash,                                                  
                        from,
                        to,
                        formattedAmount,
                        dexInfo.name,
                        functionName,
                        event.blockNumber,
                        new Date(block.timestamp * 1000).toISOString(),
                        epochTime
                    ];

                    const insertResult = await getmysqlquery(insertQuery, insertValues);
                    if (insertResult) {
                        console.log(`Successfully inserted transaction ${event.transactionHash}`);
                    } else {
                        console.error(`Failed to insert transaction ${event.transactionHash}`);
                    }
                } catch (e) {
                    console.log('Could not decode transaction data');
                }
            }
        } catch (error) {
            console.error('Error processing transfer:', error);
        }
    }
}

// Example usage
const BLOCKS_PER_QUERY = 2000; // Adjust based on RPC node limits

async function fetchHistoryInBatches(fromBlock, toBlock) {
    for (let start = fromBlock; start <= toBlock; start += BLOCKS_PER_QUERY) {
        const end = Math.min(start + BLOCKS_PER_QUERY - 1, toBlock);
        console.log(`Fetching blocks ${start} to ${end}...`);
        await getArenaTransactionHistory(start, end);
    }
}

// Start fetching (example: last 10000 blocks)
provider.getBlockNumber().then(async (currentBlock) => {
    const fromBlock = 52414724;
    await fetchHistoryInBatches(fromBlock, currentBlock);
    console.log('History fetch complete');
    process.exit(0);
}).catch(console.error); 