import { Connection, Keypair, PublicKey } from "@solana/web3.js";

import {
  Metaplex,
  keypairIdentity,
  irysStorage,
} from "@metaplex-foundation/js";

import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

import secret from "./mykey.json";

const DEVNET_RPC = "https://api.devnet.solana.com";

const SOLANA_CONNECTION = new Connection(DEVNET_RPC);

const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));

const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
    .use(keypairIdentity(WALLET))
    .use(
        irysStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: DEVNET_RPC,
            timeout: 60000,
        })
    );

const NFT_CONFIG = {
    imgName: "g00b #2028",
    symbol: "g00bs",
    sellerFeeBasisPoints: 500,
    creators: [{ address: WALLET.publicKey, share: 100 }],
    metadata: "https://gateway.pinit.io/ipfs/QmTn16A3fbgEw2XPd2wopREVvnXhp3gSmPHZoV2QuSZyb8/2028.json",
};

async function mintProgrammableNft(
    metadataUri: string,
    name: string,
    sellerFee: number,
    symbol: string,
    creators: { address: PublicKey; share: number }[]
) {
    console.log("Minting pNFT...");

    try {
        const transactionBuilder = await METAPLEX.nfts().builders().create({
            uri: metadataUri,
            name: name,
            sellerFeeBasisPoints: sellerFee,
            symbol: symbol,
            creators: creators,
            isMutable: true,
            isCollection: true,
            tokenStandard: TokenStandard.ProgrammableNonFungible,
            ruleSet: null,
            collection: new PublicKey("EKy4no5GEGcVLzpaS6pimr4ujFVHKCz5MDcxpTGDTzbk"),
        });

        let { signature, confirmResponse } = await METAPLEX.rpc().sendAndConfirmTransaction(transactionBuilder);

        console.log("Failed to connect!!!!!");

        if (confirmResponse.value.err) {
            throw new Error("Failed to confirm transaction");
        }

        const { mintAddress } = transactionBuilder.getContext();

        console.log(`Success!`);
        console.log(
            ` Minted NFT: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet`
        );
        console.log(
            ` Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`
        );
    } catch (err) {
        console.log(err);
    }
}

mintProgrammableNft(
    NFT_CONFIG.metadata,
    NFT_CONFIG.imgName,
    NFT_CONFIG.sellerFeeBasisPoints,
    NFT_CONFIG.symbol,
    NFT_CONFIG.creators
); // Run the script ts-node app.ts
