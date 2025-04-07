import {
    Keypair,
    Connection,
    clusterApiUrl,
    SystemProgram, 
    LAMPORTS_PER_SOL,
    Transaction,
    sendAndConfirmTransaction,
    ComputeBudgetProgram,
    PublicKey
    } from "@solana/web3.js";

import dotenv from "dotenv";
import bs58 from "bs58";
import {appendFile, readFileSync} from 'fs';
import {parse} from 'csv-parse';
import * as readline from 'readline';


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

// function generateAdresses(amount: number){
//     for (let count = 0; count < amount; count++) {
//         const keypair = Keypair.generate();
//         appendFile('./adresses.txt',keypair.publicKey.toBase58() + '\n', (err) => {
//             if (err) {
//             console.log('Errror: ', err)
//         }
//     });
        
//     }
// }

type Wallet ={
    address: string,
    amount: number
}

async function transferSolCsv() {
    const headers = ['address', 'amount'];
    const fileContent = readFileSync('./wallets.csv', { encoding: 'utf-8' });
  
    const res: Wallet[] = await new Promise((resolve, reject) => {
      parse(fileContent, {
        delimiter: ',',
        columns: headers,
        cast: (value, context) => {
          if (context.column === 'amount') return parseFloat(value);
          return value;
        }
      }, (error, result: Wallet[]) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 });
  
    for (const wallet of res) {
        let connection = new Connection(clusterApiUrl("devnet"),"confirmed");
        console.log(`Sending ${wallet.amount} SOL to ${wallet.address}`);

        const recipientPubKey = new PublicKey(wallet.address);

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: sender.publicKey,
            toPubkey: recipientPubKey,
            lamports: Math.floor(wallet.amount * LAMPORTS_PER_SOL),
        });

        const transaction = new Transaction().add(addPriorityFee,transferInstruction);
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [sender]
        );

        console.log(
            `Transaction signature: `,
            `https://solscan.io/tx/${signature}?cluster=devnet\n`
        );

        appendFile('./logs.txt', `.https://solscan.io/tx/${signature}?cluster=devnet\t wallet:${wallet.address}`+ ` amount:${wallet.amount}`+'\n', (err) => {
            if (err) {
              console.error('Error while writing a file:', err);
            }
        });
    }
  }

// transferSol(0.1, 0.3, 20);
// transferSolCsv();


