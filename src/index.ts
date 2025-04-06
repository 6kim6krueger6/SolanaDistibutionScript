import {Keypair,
    Connection,
    clusterApiUrl,
    SystemProgram, 
    LAMPORTS_PER_SOL,
    Transaction,
    sendAndConfirmTransaction,
    ComputeBudgetProgram
    } from "@solana/web3.js";

import dotenv from "dotenv";
import bs58 from "bs58";
import {appendFile} from 'fs';


dotenv.config();


const senderPrivateKeyString = process.env.PRIVATE_KEY as string;
const senderPrivateKey = bs58.decode(senderPrivateKeyString);
const sender = Keypair.fromSecretKey(senderPrivateKey);

function randomBetween(min: number, max: number): number{
    return Math.random()*(max - min)+min; 
}

async function transferSol(solAmountMin: number,solAmountMax: number, numberOfAccounts: number) {
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 });
    for (let account = 1; account <= numberOfAccounts; account++) {
        const solAmount = randomBetween(solAmountMin, solAmountMax);
        let connection = new Connection(clusterApiUrl("devnet"),"confirmed");
        const keypair = Keypair.generate();
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: sender.publicKey,
            toPubkey: keypair.publicKey,
            lamports: Math.floor(solAmount/numberOfAccounts * LAMPORTS_PER_SOL),
        });

        const transaction = new Transaction().add(addPriorityFee,transferInstruction);
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [sender]
        );

        console.log(
            `Transaction no.${account} signature: `,
            `https://solscan.io/tx/${signature}?cluster=devnet\n`
        );

        appendFile('./logs.txt', `${account}.https://solscan.io/tx/${signature}?cluster=devnet\t key:`+ bs58.encode(keypair.secretKey) + ` amount:${solAmount}`+'\n', (err) => {
            if (err) {
              console.error('Error while writing a file:', err);
            }
        });
        
    }
}

transferSol(0.1, 0.3, 20);


