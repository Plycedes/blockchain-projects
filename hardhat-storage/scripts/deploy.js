const { ethers, run, network } = require("hardhat");
require("dotenv").config;

async function main() {
    const StorageFactory = await ethers.getContractFactory("Storage");
    console.log("Deploying contract...");
    const storage = await StorageFactory.deploy();
    console.log(`Contract deployed to ${storage.address}`);
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Wating for 6 blocks to get mined...");
        await storage.deployTransaction.wait(6);
        await verify(storage.address, []);
    }

    const currentValue = await storage.retrive();
    console.log(`Current value: ${currentValue}`);

    const transactionResponse = await storage.store(69);
    await transactionResponse.wait(1);
    const newValue = await storage.retrive();
    console.log(`New Value: ${newValue}`);
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArgument: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified");
        } else {
            console.log(e);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

