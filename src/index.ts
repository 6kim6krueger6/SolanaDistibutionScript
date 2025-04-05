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

async function transferSol(solAmount: number, numberOfAccounts: number) {
    for (let account = 1; account <= numberOfAccounts; account++) {
        let connection = new Connection(clusterApiUrl("devnet"),"confirmed");
        const keypair = Keypair.generate();
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: sender.publicKey,
            toPubkey: keypair.publicKey,
            lamports: Math.floor(solAmount/numberOfAccounts * LAMPORTS_PER_SOL),
        });

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 });
        const transaction = new Transaction().add(addPriorityFee,transferInstruction);
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [sender]
        );

        console.log(
            `Transaction no.${account} signature: `,
            `https://solscan.io/tx/${signature}?cluster=devnet\n`,
            `Private key: ${bs58.encode(keypair.secretKey)}`
        );

        appendFile('./logs.txt', bs58.encode(keypair.secretKey) + '\n', (err) => {
            if (err) {
              console.error('Ошибка при записи файла:', err);
            } else {
              console.log('Файл успешно записан');
            }
        });
        
    }
}

transferSol(1, 15);

